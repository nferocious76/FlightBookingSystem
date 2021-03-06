'use strict';

const helper                = require(__dirname + '/../helper/helper.js');
const c                     = require(__dirname + '/../config/constant.js');

/*
 * Authentication middleware
 *
 * Parameters:
 *  database    : {object} database object
 *  resource    : {string} resource to check
 *  mode        : {string} permission access to check
 *
 * Function: Verifies token and to check permission and role
 *
 */
module.exports = (database) => {

    const acl = (resource, mode, skip_maintenance_check = false) => (req, res, next) => {

        const decoded = req.get('decoded_token');
        const roleId = decoded.role_id;
        const roleCode = decoded.role_code;

        function _proceed() {

            if (!database || !resource || !mode) return helper.send500(null, res, err, c.SERVER_ERROR);

            // skip validation
            if (roleCode.isEqualToStr('sup_admin') || roleCode.isEqualToStr('sys_admin')) return next();

            database.connection((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                skip_maintenance_check ? _validate(conn) : _is_server_down(conn);
            });
        }

        function _is_server_down(conn) {

            const query = `SELECT * FROM maintenance`;

            conn.query(query, null, (err, rows) => {
                if (err) return helper.send503(conn, res, err, c.SERVICE_UNAVAILABLE);

                const info = rows.length > 0 ? rows[0] : {};
                const is_down = info.is_down || 0;

                if (is_down) return helper.send503(conn, res, info, c.SERVICE_UNAVAILABLE);

                _validate(conn);
            });
        }

        function _validate(conn) {

            const fields = [
                's.id AS resource_id',
                's.code AS resource_code',
                's.name AS resource_name',
                's.description AS resource_description',
                's.deleted AS resource_disabled',
                'r.code AS role_code',
                'r.name AS role_name',
                'r.description AS role_description',
                'p.mode AS access_mode',
                'p.is_disabled AS access_disabled',
                'p.timestamp AS timestamp'
            ].join(', ');

            // get role's resource access permission
            const query = `SELECT ${fields} FROM permission p \
                INNER JOIN resource s ON s.id = p.resource_id \
                INNER JOIN role r ON r.id = p.role_id \
                WHERE p.role_id = ? AND LOWER(s.code) = LOWER(?) AND LOWER(p.mode) = LOWER(?)`;

            conn.query(query, [roleId, resource, mode], (err, rows) => {
                if (err || rows.length === 0) return helper.send401(conn, res, err, c.UNAUTHORIZED_REQUEST);

                const record = rows[0];

                // check if resource is deleted - service is unavailable
                if (record.resource_disabled === 1) return helper.send503(conn, res, err, c.SERVICE_UNAVAILABLE);

                // check if resource access is disabled
                if (record.access_disabled === 1) return helper.send401(conn, res, err, c.UNAUTHORIZED_REQUEST);

                database.done(conn); // release connection

                return next();
            });
        }

        _proceed();
    }

    const login_check = (resource, mode) => (req, res, next) => {

        const data = req.user_data;
        const record = data.user;
        const roleId = record.role_id;
        const roleCode = record.role_code;

        function _proceed() {

            if (!database || !resource || !mode) return helper.send500(null, res, err, c.SERVER_ERROR);

            // skip validation
            if (roleCode.isEqualToStr('sup_admin') || roleCode.isEqualToStr('sys_admin')) return helper.send200(null, res, data, c.USER_SIGNIN_SUCCESS);

            database.connection((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                _is_server_down(conn);
            });
        }

        function _is_server_down(conn) {

            const query = `SELECT * FROM maintenance`;

            conn.query(query, null, (err, rows) => {
                if (err) return helper.send503(conn, res, err, c.SERVICE_UNAVAILABLE);

                const info = rows.length > 0 ? rows[0] : {};
                const is_down = info.is_down || 0;

                if (is_down) return helper.send503(conn, res, info, c.SERVICE_UNAVAILABLE);

                _validate(conn);
            });
        }

        function _validate(conn) {

            const fields = [
                's.id AS resource_id',
                's.code AS resource_code',
                's.name AS resource_name',
                's.description AS resource_description',
                's.deleted AS resource_disabled',
                'r.code AS role_code',
                'r.name AS role_name',
                'r.description AS role_description',
                'p.mode AS access_mode',
                'p.is_disabled AS access_disabled',
                'p.timestamp AS timestamp'
            ].join(', ');

            // get role's resource access permission
            const query = `SELECT ${fields} FROM permission p \
                INNER JOIN resource s ON s.id = p.resource_id \
                INNER JOIN role r ON r.id = p.role_id \
                WHERE p.role_id = ? AND LOWER(s.code) = LOWER(?) AND LOWER(p.mode) = LOWER(?)`;

            conn.query(query, [roleId, resource, mode], (err, rows) => {
                if (err || rows.length === 0) return helper.send401(conn, res, err, c.UNAUTHORIZED_REQUEST);

                const record = rows[0];

                // check if resource is deleted - service is unavailable
                if (record.resource_disabled === 1) return helper.send503(conn, res, err, c.SERVICE_UNAVAILABLE);

                // check if resource access is disabled
                if (record.access_disabled === 1) return helper.send401(conn, res, err, c.UNAUTHORIZED_REQUEST);

                helper.send200(conn, res, data, c.USER_LOGIN_SUCCESS);
            });
        }

        _proceed();
    }

    const is_maintenance = (resource, mode) => (req, res, next) => {

        function _proceed() {

            database.connection((err, conn) => {
                if (err) return helper.sendConnError(res, err, c.DATABASE_CONN_ERROR);

                _is_server_down(conn);
            });
        }

        function _is_server_down(conn) {

            const query = `SELECT * FROM maintenance`;

            conn.query(query, null, (err, rows) => {
                if (err) return helper.send503(conn, res, err, c.SERVICE_UNAVAILABLE);

                const info = rows.length > 0 ? rows[0] : {};
                const is_down = info.is_down || 0;

                if (is_down) return helper.send503(conn, res, info, c.SERVICE_UNAVAILABLE);

                database.done(conn);
                next();
            });
        }

        _proceed();
    }

    return {
        acl,
        login_check,
        is_maintenance
    }
}