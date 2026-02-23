const { Firestore } = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.TF_VAR_project_id
});

const bucket = storage.bucket(process.env.TF_VAR_bucket_name);

const firestore = new Firestore({
  projectId: process.env.TF_VAR_project_id,
  databaseId: process.env.TF_VAR_firesotre_id
});

exports.getData = async (req, res) => {

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {

    if (req.method !== 'POST') {
      return res.status(405).json({ msg: 'Method Not Allowed' });
    }

    const collection = req.body?.collection;

    if (!collection) {
      return res.status(400).json({ msg: 'Collection requerida' });
    }

    console.log("collection:", collection);

    const snapshot = await firestore.collection(collection).get();

    let data = null;

    if (collection === 'proyects' || collection === 'skills') {
      data = await getDataFirestore(snapshot);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Error leyendo Firestore' });
  }
};

const getDataFirestore = async (snapshot) => {
  return await Promise.all(
    snapshot.docs.map(async (doc) => {

      const docData = doc.data();
      docData.urls = await Promise.all(
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
      };
    })
  );

}
