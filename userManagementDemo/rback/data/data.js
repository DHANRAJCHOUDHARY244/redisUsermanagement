
const permission = {
    user: {
        module: { 
            user: {
                action: ['/reg', '/login', '/forget-pass', '/verify-otp']
            },
            admin: {
                action: []
            },
            products: {
                action: ['/products', '/product/:id']
            }
        },
    },
    admin: {
        module: {
            user: {
                action: ['/reg', '/login', '/forget-pass', '/verify-otp']
            },
            admin: {
                action: ['/users', '/user', '/user-role-update', '/del-user']
            },
            products: {
                action: ['/products', '/product/:id', '/create', '/update/:id', '/del/:id']
            }
        }
    },
    contentAdmin: { 
        module: {
            user: {
                action: ['/reg', '/login', '/forget-pass', '/verify-otp']
            },
            admin: {
                action: ['/users', '/user', '/user-role-update']
            },
            products: {
                action: ['/products', '/product/:id', '/create', '/update/:id']
            }
        }
    },
}


module.exports = { permission }