import { useState, useEffect } from 'react';
import RfqTable from "./RfqListTable";
import { getPaginatedRfqs } from '../../services/vms/initiateVendor';
import { toast } from 'react-hot-toast';

const RfqList = () => {
  const [Rfqs, setRfqs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  // ... form states ...

const fetchRfqs = async (pageNum = page, limitPerPage = limit) => {
  try {
    const res = await getPaginatedRfqs(pageNum, limitPerPage);
    setRfqs(res.data.rfqs || []);      // fix here
    setTotal(res.data.total || 0);
    setPage(res.data.page || pageNum);
    setLimit(res.data.limit || limitPerPage);
  } catch (err) {
    console.error('Failed to fetch RFQs', err);
  }
};

  useEffect(() => {
    fetchRfqs(1, limit);
  }, [limit]);

  useEffect(() => {
    fetchRfqs(page, limit);
  }, [page]);

  // ... handlers for add/edit/delete/search/pagination ...

  return (
    <div className="container mt-4">
      
     <RfqTable
  Rfqs={Rfqs}
  total={total}
  currentPage={page}
  itemsPerPage={limit}
  onPageChange={setPage}
  onLimitChange={setLimit}
  onSearch={setSearchTerm}
  searchTerm={searchTerm}
/>

    </div>
  );
};

export default RfqList;
