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
  try {
    res.set('Access-Control-Allow-Origin', '*');

    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    // Manejar preflight (IMPORTANTE para POST)
    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    const collection = req.body.collection;

    const snapshot = await firestore.collection(collection).get();
    let data = null

    if (collection === 'proyects' || collection === 'skills') {
      console.log("collectio: " + collection)
      data = await getDataFirestore(snapshot)
    }

    //console.log(data)

    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    const msg = { status: 500, msg: 'Error leyendo Firestore' }
    res.status(500).json(msg);
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
