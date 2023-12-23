import S3 from 'aws-sdk/clients/s3';
import { createWorker } from 'tesseract.js';

const config = {
    lang: 'eng',
    oem: 1,
    psm: 3
};

export const tesseractHandler = async (event: any) => {
    console.log('Amith event: ', event, event.Records[0].s3, event.Records[0].s3.object)
    const bucket = event.Records[0].s3.bucket.name;
    const imageKey = event.Records[0].s3.object.key;
    const image = await getImage(imageKey, bucket);
    console.log('Amith image: ', image)
    const imageData = Buffer.from(image.Body as string, 'base64');
    const worker = await createWorker('eng');
    const sss = await worker.recognize(imageData)
    console.log('Amith sss: ', sss.data.text)
    await worker.terminate();
    return sss.data.text
}

function getImage(imageKey: string, bucket: string) {
    const s3 = new S3();
    const params = {
        Bucket: bucket,
        Key: imageKey,
    };
    return s3.getObject(params).promise();
};
