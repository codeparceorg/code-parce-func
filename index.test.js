const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');

require('dotenv').config();
const app = express();
app.use(express.json());


const storage = new Storage({
  projectId: process.env.PROJECT_ID
});

const bucket = storage.bucket(process.env.BUCKET);

const firestore = new Firestore({
  projectId: process.env.PROJECT_ID,
  databaseId: process.env.FIRESTORE_DATABASE_ID
});

app.get('/data', async (req, res) => {
  try {
    const collection = req.body.collection;

    const snapshot = await firestore.collection(collection).get();

    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {

        const docData = doc.data();

        let urls = [];

        urls = await Promise.all(
          docData.images.map(async (img) => {

            const file = bucket.file("imagenes/" + img);

            const [url] = await file.getSignedUrl({
              action: 'read',
              expires: Date.now() + 15 * 60 * 1000, // 15 minutos
            });

            return url;
          })
        );


        return {
          id: doc.id,
          ...docData,
          urls
        };
      })
    );


    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    const msg = { status: 500, msg: 'Error leyendo Firestore' }
    res.status(500).json(msg);
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
