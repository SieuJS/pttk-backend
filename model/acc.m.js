const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');
const saltLenght = 10 

const prisma = new PrismaClient().$extends({
    model: {
        account : {
            async signUp(username , password, type) {
                const existsAcc = await this.findUnique({
                    where : {
                        username : username
                    }
                })
                if (existsAcc) throw Error("Already account in database")

                let salt = bcrypt.genSaltSync(saltLenght);
                let hashpw = bcrypt.hashSync(password, salt);

                let createdAcc ;
                try {
                    createdAcc = await prisma.account.create({
                        data : {
                            username, 
                            password : hashpw,
                            type
                        }
                    })
                }catch (err) { 
                    console.log("Acc model, line 30 ", err.message);
                    throw Error("There some error occured in create account")
                }
                
                return {
                    username : createdAcc.username,
                    type : createdAcc.type
                }
            },
            async signIn (username, password) {
                const existsAcc = await this.findUnique({
                    where : {
                        username : username
                    }
                })
                if (!existsAcc) throw Error("Not exists account in database") ;

                if (!bcrypt.compareSync(password, existsAcc.password)) {
                    throw Error("Wrong password")
                }
                return {
                    username : existsAcc.username,
                    type : existsAcc.type
                };
            }
        }
    }
}) ; 

module.exports =  prisma.account; 

