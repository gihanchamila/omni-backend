import { PutObjectCommand, S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { awsAccessKey, awsSecretAccessKey, awsBucketName, awsRegion } from "../config/kyes.js";
import { generateCode } from "./generateCode.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
    region : awsRegion,
    credentials : {
        accessKeyId : awsAccessKey,
        secretAccessKey : awsSecretAccessKey
    }
});

export const uploadFileToS3 = async({file, ext}) => {
    // Generate random number 
    const Key = `${generateCode(12)}_${Date.now()}${ext}`

    const params = {
        // all the keys that are start with param object is capitalized

        Bucket : awsBucketName,
        Body : file.buffer,
        Key,
        ContentType : file.mime
    }

    const command = new PutObjectCommand(params)

    try{
        await client.send(command)
        return Key
    }catch(error){
        console.log(error)
    }
}

export const signedUrl = async(Key) => {
    const params = {
        Bucket : awsBucketName,
        Key
    }

    const command = new GetObjectCommand(params)

    try{
        const url = await getSignedUrl(client, command, {expiresIn : 100})
        return url
    }catch(error){
        console.log(error)
    }
}

export const deleteFilesFromS3 = async(Key) => {
    const params = {
        Bucket : awsBucketName,
        Key
    }

    const command = new DeleteObjectCommand(params)

    try{
        await client.send(command)
        return
    }catch(error){
        console.log(error)
    }
}