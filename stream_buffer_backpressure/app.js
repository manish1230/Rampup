const express=require("express");
const fs=require("fs");

const path=require("path");

const inputfile=path.join(__dirname,"input.txt");
const outputfile=path.join(__dirname,"output.txt");


const readStream=fs.createReadStream(inputfile);

const writeStream=fs.createWriteStream(outputfile);

// automatic backpressure handling
// readStream.pipe(writeStream);

// manual handling
readStream.on("data",chunk=>{
    const canwrite=writeStream.write(chunk);

    if(!canwrite){
        readStream.pause();
    }

    writeStream.once("drain",()=>{
   readStream.resume();
    });

})

console.log("success");