const express = require('express');
const router = express.Router();
const {nanoid} = require('nanoid');
const Paste = require('../schemas/create');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.post('/api/pastes', async (req, res) => {
    const {content, max_views, ttl_seconds } = req.body;
    const uid = nanoid(8);
    const expires = new Date(Date.now() + (ttl_seconds * 1000));
    console.log(content, max_views, ttl_seconds, expires);
    let paste;
    try {
        paste = await Paste.create({
            url: 'http'+':'+'//'+process.env.BASE_URL+'/p/'+uid,
            content,
            max_views,
            expires,
        })
    } catch (err) {
        console.log(err.toString());
        return res.status(400).json({error: err.toString()});
    }
    console.log('Paste created successfully')
    res.status(200).json({ id: paste._id, url: paste.url });
});

router.get('/api/pastes', async (req, res) => {
    let pastes;
    try {
        pastes = await Paste.find().sort({expires: 1});
    } catch (err) {
        console.log(err.toString());
        return res.status(400).json({error: err.toString()});
    }
    if (!pastes) {
        return res.status(404).json({error: 'No pastes found'});
    }
    pastes = pastes.filter(u => u.expires.getTime() > Date.now() && u.views < u.max_views);
    console.log('Sent All Url\'s Successfully');
    res.status(200).render('pastes', { pastes });
});

router.get('/p/:id', async (req, res) => {  
    let paste;
    const { id } = req.params;
    try {
        console.log(id, new ObjectId(id));
        paste = await Paste.findOneAndUpdate(
            { _id: new ObjectId(id), $expr: { $lt: ['$views', '$max_views'] }},
            {$inc: {views: 1} },
            { new: true}
        );
        if (!paste || paste.expires.getTime() < Date.now()) {
            await Paste.findOneAndDelete(
                { _id: id }
            );
            throw new Error('Paste Expired !');
        }
    } catch (err) {
        console.log(err.toString());
        return res.status(400).json({error: err.toString()});
    }

    console.log('Sent Paste Successfully');
    res.status(200).render('view', { content: paste.content });
});

router.get('/api/pastes/:id', async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'Paste not found' });
  }

  try {
    const now = new Date();

    const paste = await Paste.findById(id);

    if (!paste) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    if (paste.expires && paste.expires < now) {
      return res.status(404).json({ error: 'Paste expired' });
    }

    if (
      paste.max_views !== null &&
      paste.max_views !== undefined &&
      paste.views >= paste.max_views
    ) {
      return res.status(404).json({ error: 'View limit exceeded' });
    }

    paste.views += 1;
    await paste.save();

    const remainingViews =
      paste.max_views != null
        ? Math.max(paste.max_views - paste.views, 0)
        : null;

    return res.status(200).json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expires ?? null
    });

  } catch (err) {
    console.error(err);
    return res.status(404).json({ error: 'Paste unavailable' });
  }
});

router.get('/api/healthz', async (req, res) => {
    return res.status(200).json({ok: true});
})


module.exports = router;