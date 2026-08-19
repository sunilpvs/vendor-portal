export const parseUserRoles = (data) => {
    if (Array.isArray(data)) {
        return data.map((item) => Number(item?.role_id)).filter((role) => !Number.isNaN(role));
    }
    if (data?.role_id !== undefined) {
        return [Number(data.role_id)].filter((role) => !Number.isNaN(role));
    }
    return [];
};
