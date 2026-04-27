const https = require('https');

const candidateIds = [
  '1600596542815-ffad4c1539a9', '1600585154340-be6161a56a0c', '1600566753190-17f0baa2a6c3', '1512917774080-9991f1c4c750', '1600607687920-4e2a09cf159d', '1600566752355-35792bedcfea', '1600585154526-990dced4ea0d', '1600607687644-c7171b42498b', '1600566753151-384129cf4e3e', '1600566753086-00f18fb6b3ea', '1502005097973-f5aa267df27f', '1510627489930-0c1b0bfb6785', '1600047509807-ba8f99d2cdde', '1600607688969-a5bfcd64bd40', '1600566752229-250ce0148288', '1613977257363-707ba9348227', '1613490908676-e13d96924c7f', '1613490908208-202e8653fb93', '1583608205776-bfd35f0d9f83', '1580587771525-78b9dba3b914', '1510798831971-661eb04b3739', '1512915922686-57c11dde9b6b', '1449844908441-8829872d2607', '1513584684374-8bab748fbf90', '1484154218962-a197022b5858', '1493809842364-78817add7ffb', '1480074568708-e7b720bb3f09', '1502672260266-1c1e52b1df95', '1494526585095-c41746248156', '1464146072230-91cabc968266', '1416331108676-a22ccb276e35', '1430285561322-780f60f32e2b', '1522708323590-d24dbb6b0267', '1413693029692-a1b415a7824c', '1416339412971-518218e815e1', '1448630360428-654568856b65', '1475855581690-80cbc4bd5a2e', '1472224371017-0820efc66159', '1497362943212-074bc056637e', '1488805990569-36a8af39ea49', 
  '1518780664697-55e3ad937233', '1564013799919-ab600027ffc6', '1582268611958-ebfd161ef9cf', '1515263487926-c624173584d4', '1568605114967-8130f3a36e1a', '1576941089084-df233b2069ce', '1584622650111-993a426fbf0a', '1560518883-ce09059eeffa'
];

async function checkUrl(id) {
  const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      // follow redirects if needed, but Unsplash usually gives 200 or 404 directly or 302
      if (res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 301) {
        resolve(id);
      } else {
        resolve(null);
      }
    }).on('error', () => resolve(null));
  });
}

async function run() {
  // deduplicate
  const uniqueIds = [...new Set(candidateIds)];
  const validIds = [];

  for (const id of uniqueIds) {
    const valid = await checkUrl(id);
    if (valid) {
      validIds.push(valid);
      if (validIds.length >= 40) {
        break;
      }
    }
  }

  console.log('Valid IDs found:', validIds.length);
  console.log(JSON.stringify(validIds));
}

run();
