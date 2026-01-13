import axiosInstance from "../../utils/axiosInstance";


export const getVendorActivityLogs = (page=1, limit = 10, module=null, username=null, from=null, to=null) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if(module) params.append("module", module);
    if(username) params.append("username", username);
    if(from) params.append("from", from);
    if(to) params.append("to", to);


    return axiosInstance.get(`api/logs/activity-log-api.php?type=vendor&${params.toString()}`);

}


export const getActivities = (page=1, limit = 10, module=null, username=null, from=null, to=null) => {
    const params = new URLSearchParams();

    params.append("page", page);
    params.append("limit", limit);

    if(module) params.append("module", module);
    if(username) params.append("username", username);
    if(from) params.append("from", from);
    if(to) params.append("to", to);


    return axiosInstance.get(`api/logs/activity-log-api.php?${params.toString()}`);

}

