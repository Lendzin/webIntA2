/**
 * ItemsControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const csv = require('csvtojson');

const pathBlogData = './../../blogdata.txt';

module.exports = {

  getXIterations: async function(req, res) {
    const numberOfIterations = req.param('number');
    console.log(numberOfIterations);
    let blogData = await getBlogData();
    console.log(Object.keys(blogData).length)
    for (const [i, blog] of blogData.entries()) {
      console.log(i)
    }
  },

  getAllAssignments: async function(req, res) {
    
  },

  getHierarchicalClustering() {

  }

};


async function getBlogData() {
  return await csv({delimiter: '	'}).fromFile(__dirname + pathBlogData);
}



function getPearson(blogA, blogB, wordCount) {
  let sumA = 0;
  let sumB = 0;
  let sumASq = 0;
  let sumBSq = 0;
  let pSum = 0;
  let n = wordCount;
  let den = 0;

  for (let i = 0; i < n; i++) {
    let cntA = blogA.getWordCount(i);
    let cntB = blogB.getWordCount(i);
    sumA += cntA;
    sumB += cntB;
    sumASq += Math.power(cntA, 2);
    sumBSq += Math.power(cntB, 2);
    pSum += cntA * cntB;
  }

  num = pSum - (sumA * sumB / n);
  den = Math.sqrt((sumASq - Math.pow(sumA, 2) / n) * (sumBSq - Math.pow(sumB, 2) / n ));

  return 1.0 - num/den;
}
