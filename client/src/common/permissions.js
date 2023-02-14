export const hasPermission = (userPermissions, permission) => {
    return userPermissions.includes(permission);
};

export const hasPermissionsOr = (userPermissions, permissions) => {
    return permissions.reduce((result, permission) => {
        return hasPermission(userPermissions, permission) || result;
    }, false);
};
