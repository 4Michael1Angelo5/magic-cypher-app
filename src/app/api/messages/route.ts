import { prisma } from "@/lib/prisma"; 
import { JSONcipherRequest } from "@/app/types/JSONcipherResponse";

//handles POST operations , allows user to create to store cipher message in database
 
export const POST = async (req: Request): Promise<Response> => {
    
     
    try     
        {  
            // console.log("recieved request: ", req)
            const body:JSONcipherRequest = await req.json();

            if (!body.input || !body.userId ) {
                return new Response(JSON.stringify({error: "No mesage recieved"}),{
                    status:400,
                    headers: {"Content-Type" : "application/json"},
                });
            }
            const savedMessage = await prisma.cipherMessage.create({
                data:
                    {
                        userId: body.userId,
                        input:body.input,
                        output:body.output, 
                        encryptionKey: body.encryptionKey,
                        time:body.time
                    }
                
            });
           

            return new Response(JSON.stringify(savedMessage),{
                status:201,
                headers: {"Content-Type":"application/json"},
            });

        }
    catch(error)
        {
            console.error("error saving message",error);

            return new Response(JSON.stringify({error: "Internal Server Error"}),{
                status:500,
                headers:{"Content-Type" : "application/json"}
            })

        }
  };
 
