import { PrismaClient } from '@prisma/client';

// Declare a global scoped variable for prisma to avoid multiple instances during development
// this is neccessary because in development there are hotreloads which will create multiple 
// instances of prisma we will get the error:
// Error: PrismaClient cannot be used in multiple instances. Please make sure you have only one instance of PrismaClient.

declare global {
    var prisma: PrismaClient | undefined;
}

// instantiate local scoped prisma variable as type prisma client 
  
let prisma:PrismaClient;

// if the app is runing in production environemnt
if(process.env.NODE_ENV === "production"){
    // create new prisma client object 
    // (no issue with hotloading and creating multiple instances of PrismaClient)
    prisma = new PrismaClient();
}else {
    //otherwise we are in development environment
    if (!global.prisma){

        //if the global variable is undefined create an new instance of it
        global.prisma = new PrismaClient();

    }
    // otherwise
    // reference the global instance instead of creating 
    // a new one to avoid multiple clients 
    prisma = global.prisma
}
 



export { prisma }

 
