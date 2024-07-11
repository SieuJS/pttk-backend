const bcrypt = require('bcryptjs');
const saltLenght = 10 
const {PrismaClient} = require('@prisma/client');
const HttpsError = require('../model/error.m');
const provideJWT = require('../utils/access-token-generater')

const prisma = new PrismaClient();

async function signIn (req, res,next) {
    const {username, password} = req.body; 
    try {
        const account = await prisma.account.findUnique({
            where : {
                username : username
            }
        })

        if (!account) {
            return next (new HttpsError("Tài khoản không tồn tại"))
        }

        if (!bcrypt.compareSync(password, account.password)) {
            return next (new HttpsError("Sai mật khẩu"))
        }
        if (account.type.toLowerCase().includes('nv')) {
            return next (new HttpsError('Không thể đăng nhập với tài khoản này'))
        }
        let accessToken = provideJWT(account)

        return res.status(200).json({
            accessToken,
            account ,
            message : "Sign in success"
        })
        
    }catch (err) {
        console.log(err) ;
        return next (new HttpsError("Lỗi không xác định khi đăng nhập",500));
    }
}

async function signUp (req, res, next) {
    const {username, password} = req.body;
    const type = "Khách" ;
    prisma.account.signUp(username, password, type);
}

module.exports = {
    signIn , signUp
};