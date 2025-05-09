const cluster=require("cluster");
const http=require("http");

// if(cluster.isMaster){
    console.log(`master process with pid ${process.pid}`);
//     cluster.fork();
//     cluster.fork();
// }
// else{
    console.log(`child process with pid ${process.pid}`);

    const server=http.createServer((req,res)=>{
      if(req.url==="/p1"){
        res.writeHead(200,{"content-type":"text/plain"});
        res.end("home page");
      }
      else if(req.url==="/p2"){
        for(let i=0;i<6000000000;i++){}

        res.writeHead(200,{"content-type":"text/plain"});
        res.end("slow page");
      }
    });

    server.listen(8000,()=>{
        console.log("server is running in port 8000...");
    })
// }