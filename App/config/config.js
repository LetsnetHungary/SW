var config = {
    server: '127.0.0.1',
    port: '3000',
    email: {
        service: 'gmail',
        xoauth2: {
            client_user: 'hegel.akos1@gmail.com',
            client_id: '1073354036358-sm3mqdoco8vo87r5g1urjqp13527l812.apps.googleusercontent.com',
            secret: 'msY_bwgHiz24JQhd6JXMHPg8',
            refresh_token: '1/_tFkcE1bJKQObnD2q_ZEEVnZoRhTeklA6Z4gW4YG-1Y'
        }
    },
    database: {
        user: 'test',
        passwd: 'letsnetHungary',
        url: '@ds161042.mlab.com:61042/letsnet'
    }
}

module.exports = config
