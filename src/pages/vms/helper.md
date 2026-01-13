<?php
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../classes/Logger.php';
require_once __DIR__ . '/../../classes/authentication/middle.php';
require_once __DIR__ . '/../../classes/authentication/LoginUser.php';
require_once $_SERVER['DOCUMENT_ROOT'] . '/classes/vms/Documents.php';
require_once __DIR__ . '../../../classes/vms/CounterPartyInfo.php';

// Authenticate using JWT
authenticateJWT();


$method = $_POST['_method'] ?? $_GET['_method'] ?? $_SERVER['REQUEST_METHOD'];
$method = strtoupper($method);

$config = parse_ini_file($_SERVER['DOCUMENT_ROOT'] . '/app.ini');
$debugMode = isset($config['DEBUG_MODE']) && in_array(strtolower($config['DEBUG_MODE']), ['1', 'true'], true);
$logDir = $_SERVER['DOCUMENT_ROOT'] . '/logs';
$logger = new Logger($debugMode, $logDir);

$docOb = new Documents();
$counterPartyInfoOb = new CounterPartyInfo();
$auth = new UserLogin();
$username = $auth->getUserIdFromJWT() ?: 'guest';
$module = 'DOCUMENTS';

// $method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);




switch ($method) {
    case 'GET':
        $logger->log("GET request received");

        if (isset($_GET['id'])) {
            $docId = intval($_GET['id']);
            $data = $docOb->getDocumentById($docId, $module, $username);
            $status = $data ? 200 : 404;
            $response = $data ?: ["error" => "Document not found"];
            http_response_code($status);
            echo json_encode($response);
            $logger->logRequestAndResponse($_GET, $response);
            break;
        }

        if (isset($_GET['reference_id'])) {
            $referenceId = $_GET['reference_id'];
            $data = $docOb->getDocumentsByReferenceId($referenceId, $module, $username);
            http_response_code(200);
            echo json_encode($data);
            $logger->logRequestAndResponse($_GET, $data);
            break;
        }

        // Paginated documents response
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $limit = isset($_GET['limit']) ? max(1, intval($_GET['limit'])) : 10;
        $offset = ($page - 1) * $limit;

        $data = $docOb->getPaginatedDocuments($offset, $limit, $module, $username);
        $total = $docOb->getDocumentsCount($module, $username);

        $response = [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'documents' => $data,
        ];

        http_response_code(200);
        echo json_encode($response);
        $logger->logRequestAndResponse($_GET, $response);
        break;

    case 'POST':
        $logger->log("POST request received");

        if (!isset($_GET['reference_id'])) {
            http_response_code(400);
            $error = ["error" => "Reference ID is required"];
            echo json_encode($error);
            return;
        }

        $referenceId = $_GET['reference_id'];
        $uploadDir = __DIR__ . "/../../uploads/vendor_reference/$referenceId/documents/";

        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        /************************************************
         * NORMALIZE INPUT
         ************************************************/
        $docIds   = $_POST['doc_ids']   ?? [];
        $docTypes = $_POST['doc_types'] ?? [];
        $files    = $_FILES['files']    ?? null;

        if (!is_array($docIds))   $docIds   = [$docIds];
        if (!is_array($docTypes)) $docTypes = [$docTypes];

        $docIds   = array_values($docIds);
        $docTypes = array_values($docTypes);

        $fileNames = $tmpNames = $errors = [];
        
        if ($files && isset($files['name'])) {
            $fileNames = is_array($files['name']) ? array_values($files['name']) : [$files['name']];
            $tmpNames  = is_array($files['tmp_name']) ? array_values($files['tmp_name']) : [$files['tmp_name']];
            $errors    = is_array($files['error']) ? array_values($files['error']) : [$files['error']];
        }

        /************************************************
         * LOAD EXISTING FROM DB
         ************************************************/
        $existingDocs = $docOb->getDocumentsByReferenceId($referenceId, $module, $username);
        $existingById = [];
        $existingIds = [];

        foreach ($existingDocs as $ed) {
            $id = (int)$ed['doc_id'];
            $existingById[$id] = $ed;
            $existingIds[] = $id;
        }

        $submittedExistingIds = [];
        $responses = [];
        $successCount = 0;

        /************************************************
         * DETECT MODE:
         * UPDATE MODE = counts match
         * INSERT MODE = counts mismatch
         ************************************************/
        $docIdCount   = count($docIds);
        $docTypeCount = count($docTypes);
        $fileCount    = count($fileNames);

        $updateMode = (
            $docIdCount > 0 &&
            $docIdCount === $docTypeCount &&
            $docIdCount === $fileCount
        );

        foreach ($docIds as $id) {
            if ($id !== "" && $id !== null) {
                $submittedExistingIds[] = intval($id);
            }
        }

        /************************************************
         * A) UPDATE MODE (index-aligned)
         ************************************************/
        if ($updateMode) {

            for ($i = 0; $i < $docIdCount; $i++) {

                $docId   = intval($docIds[$i]);
                $docType = trim($docTypes[$i]);
                $fileProvided = isset($fileNames[$i]) && $errors[$i] !== UPLOAD_ERR_NO_FILE;

                $submittedExistingIds[] = $docId;

                if (!isset($existingById[$docId])) {
                    $responses[] = ["doc_id" => $docId, "error" => "Document not found"];
                    continue;
                }

                $existing = $existingById[$docId];
                $oldFileAbs = $_SERVER['DOCUMENT_ROOT'] . '/' . $existing['file_path'];

                /*********** UPDATE FILE ***********/
                if ($fileProvided) {

                    if ($errors[$i] !== UPLOAD_ERR_OK) {
                        $responses[] = ["doc_id" => $docId, "error" => "File upload error"];
                        continue;
                    }

                    if (file_exists($oldFileAbs)) @unlink($oldFileAbs);

                    $newName = time() . "_" . basename($fileNames[$i]);
                    $target  = $uploadDir . $newName;

                    if (!move_uploaded_file($tmpNames[$i], $target)) {
                        $responses[] = ["doc_id" => $docId, "error" => "Failed to move uploaded file"];
                        continue;
                    }

                    $newPath = "uploads/vendor_reference/$referenceId/documents/$newName";
                    $newType = $docType ?: $existing['doc_type'];

                    $ok = $docOb->updateDocument($docId, $referenceId, $newType, $newPath, $module, $username);

                    if ($ok) {
                        $responses[] = ["doc_id" => $docId, "status" => "updated_file"];
                        $successCount++;
                    } else {
                        @unlink($target);
                        $responses[] = ["doc_id" => $docId, "error" => "DB update failed"];
                    }

                    continue;
                }

                /*********** UPDATE DOC TYPE ONLY ***********/
                if ($docType && $docType !== $existing['doc_type']) {

                    $ok = $docOb->updateDocument($docId, $referenceId, $docType, $existing['file_path'], $module, $username);

                    if ($ok) {
                        $responses[] = ["doc_id" => $docId, "status" => "updated_doc_type"];
                        $successCount++;
                    } else {
                        $responses[] = ["doc_id" => $docId, "error" => "DB update failed"];
                    }

                    continue;
                }

                /*********** NO CHANGE ***********/
                $responses[] = ["doc_id" => $docId, "status" => "no_change"];
            }
        }


        /************************************************
         * B) INSERT MODE (counts DO NOT match)
         ************************************************/
        else {

            for ($i = 0; $i < count($docTypes); $i++) {

                $docType = trim($docTypes[$i]);
                $fileProvided = isset($fileNames[$i]) && $errors[$i] !== UPLOAD_ERR_NO_FILE;

                if ($docType === "" && !$fileProvided) continue;
                if ($docType === "") {
                    $responses[] = ["index" => $i, "error" => "doc_type required"];
                    continue;
                }
                if (!$fileProvided) {
                    $responses[] = ["index" => $i, "error" => "file required"];
                    continue;
                }
                if ($errors[$i] !== UPLOAD_ERR_OK) {
                    $responses[] = ["index" => $i, "error" => "file upload error"];
                    continue;
                }

                $newName = time() . "_" . basename($fileNames[$i]);
                $target  = $uploadDir . $newName;

                if (!move_uploaded_file($tmpNames[$i], $target)) {
                    $responses[] = ["index" => $i, "error" => "Failed to move uploaded file"];
                    continue;
                }

                $newPath = "uploads/vendor_reference/$referenceId/documents/$newName";

                $newId = $docOb->insertDocument($referenceId, $docType, $newPath, $module, $username);

                if ($newId) {
                    $responses[] = ["doc_id" => $newId, "status" => "inserted"];
                    $submittedExistingIds[] = $newId;
                    $successCount++;
                } else {
                    @unlink($target);
                    $responses[] = ["index" => $i, "error" => "DB insert failed"];
                }
            }
        }


        /************************************************
         * C) DELETE ANY DOCUMENT NOT SUBMITTED
         ************************************************/
        $toDelete = array_diff($existingIds, $submittedExistingIds);

        foreach ($toDelete as $delId) {
            $rec = $existingById[$delId];
            $fileAbs = $_SERVER['DOCUMENT_ROOT'] . '/' . $rec['file_path'];

            if (file_exists($fileAbs)) @unlink($fileAbs);

            $docOb->deleteDocument($delId, $module, $username);

            $responses[] = ["doc_id" => $delId, "status" => "deleted"];
        }

        /************************************************
         * FINAL RESPONSE
         ************************************************/
        http_response_code(200);
        echo json_encode([
            "message" => "Processed documents",
            "details" => $responses
        ]);

        break;


    case 'PUT':
        $logger->log("PUT request received (via method override)");

        if (!isset($_GET['reference_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Reference ID is required"]);
            break;
        }

        $referenceId = $_GET['reference_id'];

        if (!isset($_FILES['files']) || !isset($_POST['doc_ids']) || !isset($_POST['doc_types'])) {
            http_response_code(400);
            echo json_encode(["error" => "Files, doc_ids and doc_types are required"]);
            break;
        }

        $files = $_FILES['files'];
        $docIds = $_POST['doc_ids'];
        $docTypes = $_POST['doc_types'];

        if (!is_array($files['name'])) {
            http_response_code(400);
            echo json_encode(["error" => "files must be an array"]);
            break;
        }

        // if (count($files['name']) !== count($docIds) || count($docIds) !== count($docTypes)) {
        //     http_response_code(400);
        //     echo json_encode(["error" => "Mismatch in number of files, doc_ids, and doc_types"]);
        //     break;
        // }

        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . "/uploads/vendor_reference/$referenceId/documents/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $responses = [];

        foreach ($files['name'] as $i => $name) {
            $docId = intval($docIds[$i]);
            $docType = $docTypes[$i];

            $existingDoc = $docOb->getDocumentById($docId, $module, $username);
            if (!$existingDoc) {
                $responses[] = ["doc_id" => $docId, "error" => "Document not found"];
                continue;
            }

            // DELETE ALL old files belonging to this document
            $oldPath = $_SERVER['DOCUMENT_ROOT'] . '/' . $existingDoc['file_path'];

            if (file_exists($oldPath)) {
                unlink($oldPath);
            }

            // Also remove previous uploads with same doc type (PAN, GST etc.)
            $pattern = $uploadDir . '*' . $existingDoc['doc_type'] . '*';
            foreach (glob($pattern) as $oldFile) {
                if (is_file($oldFile)) unlink($oldFile);
            }


            // Upload new file
            $fileName = time() . "_" . basename($name);
            $targetPath = $uploadDir . $fileName;

            if (!move_uploaded_file($files['tmp_name'][$i], $targetPath)) {
                $responses[] = ["doc_id" => $docId, "error" => "Failed to upload"];
                continue;
            }

            $dbFilePath = "uploads/vendor_reference/$referenceId/documents/$fileName";

            // Update DB
            $updated = $docOb->updateDocument($docId, $referenceId, $docType, $dbFilePath, $module, $username);

            $responses[] = $updated
                ? ["doc_id" => $docId, "status" => "updated", "file_path" => $dbFilePath]
                : ["doc_id" => $docId, "error" => "DB update failed"];
        }

        echo json_encode(["results" => $responses]);
        break;


    case 'DELETE':
        $logger->log("DELETE request received");

        if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
            http_response_code(400);
            $error = ["error" => "Document ID is required and must be numeric"];
            echo json_encode($error);
            $logger->logRequestAndResponse($_GET, $error);
            break;
        }

        $docId = intval($_GET['id']);
        $result = $docOb->deleteDocument($docId, $module, $username);

        $response = $result > 0
            ? ["message" => "Document deleted successfully"]
            : ["error" => "Failed to delete document"];

        http_response_code($result > 0 ? 200 : 500);
        echo json_encode($response);
        $logger->logRequestAndResponse($_GET, $response);
        break;

    default:
        http_response_code(405);
        $error = ["error" => "Method not allowed"];
        echo json_encode($error);
        $logger->logRequestAndResponse($_SERVER, $error);
        break;
}
