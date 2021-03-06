/**
 * ItemsControllerController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const csv = require('csvtojson');
// const {parse, stringify} = require('flatted/cjs')
var stringify = require('json-stringify-safe')
// var CircularJSON = require('circular-json-es6')

const pathBlogData = './../../blogdata.txt';
var Cluster = (function() {
  var nextId = 1;

  return function Cluster() {
    this.id = nextId++;
    this.parent = null;
    this.left = null;
    this.right = null;
    this.blog = null;
    this.distance = 0;
  };
})();

module.exports = {

  getXIterations: async function(req, res) {
    const numberOfIterations = req.param('number');
    let centroids = await getCentroids(numberOfIterations);
    let obj = {};
    for (const [i, centroid] of centroids.entries()) {
      obj[i] = centroid['assignedBlogs']
    }
    return res.status(200).json(obj);
  },

  getAllAssignments: async function(req, res) {
    let centroids = await getCentroids2();
    let obj = {};
    for (const [i, centroid] of centroids.entries()) {
      obj[i] = centroid['assignedBlogs']
    }

    return res.status(200).json(obj);
  },

  getHierarchicalClustering: async function(req, res) {
    let blogData = await getBlogData();
    let n = await getWordsCount(blogData);
    let listOfClusters = await generateBlogClusters(blogData);
    let result = await hierarchyGeneration(listOfClusters, n);
    result = await stringify(result);

    return res.status(200).send(result);
  }
};


async function generateBlogClusters(blogData) {

  listOfClusters = [];

  for (const [i, blog] of blogData.entries()) {
    cluster = new Cluster();
    cluster.blog = blog;
    listOfClusters.push(cluster);
  }
  return listOfClusters;
}



async function hierarchyGeneration(listOfClusters, n) {
  while (listOfClusters.length > 1) {

    let closest = Number.MAX_VALUE;
    this.clusterA = new Cluster();
    this.clusterB = new Cluster();

    listOfClusters.forEach(clusterX => {
      listOfClusters.forEach(clusterY => {
        let distance = getPearson(clusterX.blog, clusterY.blog, n);
        if (distance < closest && clusterX.id !== clusterY.id) {

          closest = distance;
          clusterA = clusterX;
          clusterB = clusterY;
        }
      });
    });
    let clusterC = new Cluster();
    clusterC = mergeClusters(clusterA, clusterB, closest);
    console.log(listOfClusters.length)

    listOfClusters.push(clusterC);
    let newList = listOfClusters.filter(cluster => {
      return (cluster.id !== clusterA.id && cluster.id !== clusterB.id);
    });
    listOfClusters = newList;
  }
  return listOfClusters;
}

function mergeClusters(clusterA, clusterB, distance) {
  let parentCluster = new Cluster();

  clusterA.parent = parentCluster;
  clusterB.parent = parentCluster;
  parentCluster.left = clusterA;
  parentCluster.right = clusterB;

  let newBlog = {};
  for (let key in clusterA.blog) {
    let newValue = (Number(clusterA.blog[key]) + Number(clusterB.blog[key]))/2;
    newBlog[key] = newValue;
  }
  parentCluster.blog = newBlog;
  parentCluster.distance = distance;
  return parentCluster;
}

async function getCentroids2() {  //Mainly repetition (not following DRY pattern in this iteration)
  let blogData = await getBlogData();

  let n = await getWordsCount(blogData);
  let maxCountFromBlogs = await getMaxWordCountFromBlogs(n, blogData);
  let centroids = [];
  let k = 5;

  for(let c = 0; c < k; c++ ) {
    let centroid = {};
    centroid = await getRandomWordCounts(maxCountFromBlogs);
    centroid.assignedBlogs = [];
    centroid.previousAssignment = [];
    centroids.push(centroid);
  }
  while (checkCentroids(centroids)) {
    centroids.forEach(centroid => { 
      centroid.previousAssignment = JSON.parse(JSON.stringify(centroid['assignedBlogs'])); //make a copy to previous assignments of the assigned blogs
      centroid['assignedBlogs'] = []; //empty assignments
    });
    for (const [i, blog] of blogData.entries()) {  // go through all blogs and pick a blog
      let distance = Number.MAX_VALUE;
      bestCentroid = {};
      for (const [i, centroid] of centroids.entries()) {
        let cDist = getPearson(centroid, blog, n);
        if (cDist < distance) {
          bestCentroid = centroid;
          distance = cDist;
        }
      }
      bestCentroid.assignedBlogs.push(blog);
    }
    centroids.forEach(centroid => {
      let length = centroid['assignedBlogs'].length;
      for (let key in centroid) {
        if (key === 'assignedBlogs' || key === 'previousAssignment') {
        // do nothing
        } else {
          if (length > 0) {
            for (let key in centroid) {  // reset the centroid to 0, if it has assigned blogs.
              if (key === 'assignedBlogs' || key === 'previousAssignment') {
              // do nothing
              } else {
                centroid[key] = 0;
              }
            }
            centroid['assignedBlogs'].forEach(blog => { // add the values of the blogs to the centroid
              for (let key in blog) {
                if (key === 'Blog' || key === 'previousAssignment') {
                // do nothing
                } else {
                  centroid[key]+= Number(blog[key]);
                }
              }
            });
            for (let key in centroid) {  
              if (key === 'assignedBlogs' || key === 'previousAssignment') { //add the average values to the centroid
              // do nothing
              } else {
                centroid[key] = centroid[key]/length;
              }
            }
          }
        }
      }
    });
  }
  return centroids;
}


function checkCentroids(centroids) {
  
  let centroidsWithPreviousAssign = centroids.filter(centroid => {
    return (centroid['previousAssignment'].length > 1);
  });

  if (centroidsWithPreviousAssign.length > 1) {
    let currentState = []
    centroidsWithPreviousAssign.forEach(centroid => {
      blogsInPrevious = (getBlogsInArray(centroid['previousAssignment']));
      blogsInCurrent = (getBlogsInArray(centroid['assignedBlogs']));
      blogsInPrevious.sort();
      blogsInCurrent.sort();
      currentState.push((JSON.stringify(blogsInPrevious) === JSON.stringify(blogsInCurrent)))
    });

    stateContainsUnequality = []
    currentState.forEach(state => {
      if (state) {
        // do nothing
      } else {
        stateContainsUnequality.push(state);
      }
    });

    if (stateContainsUnequality.length === 0) {
      // console.log(stateContainsUnequality)
      return false;
    } else {
      // console.log(stateContainsUnequality)
      return true;
    }
  } else {
    return true;
  }
  
}

function getBlogsInArray(array) {
  let newArray = [];
  array.forEach(blog => {
    newArray.push(blog.Blog);
  });
  return newArray;
}

async function getCentroids(numberOfIterations) {
  let blogData = await getBlogData();

  let n = await getWordsCount(blogData);
  let maxCountFromBlogs = await getMaxWordCountFromBlogs(n, blogData);
  let centroids = [];
  let k = 5;

  for(let c = 0; c < k; c++ ) {
    let centroid = {};
    centroid = await getRandomWordCounts(maxCountFromBlogs);
    centroid.assignedBlogs = [];
    centroids.push(centroid);
  }
  for (let i = 0; i < numberOfIterations; i++) {

    centroids.forEach(centroid => { //empty assignments
      centroid['assignedBlogs'] = [];
    });
    for (const [i, blog] of blogData.entries()) {  // go through all blogs and pick a blog
      let distance = Number.MAX_VALUE;
      bestCentroid = {};
      for (const [i, centroid] of centroids.entries()) {
        let cDist = getPearson(centroid, blog, n);
        if (cDist < distance) {
          bestCentroid = centroid;
          distance = cDist;
        }
      }
      bestCentroid.assignedBlogs.push(blog);
    }
    centroids.forEach(centroid => {
      let length = centroid['assignedBlogs'].length;
      for (let key in centroid) {
        if (key === 'assignedBlogs') {
          // do nothing
        } else {
          if (length > 0) {
            for (let key in centroid) {  // reset the centroid to 0, if it has assigned blogs.
              if (key === 'assignedBlogs') {
                // do nothing
              } else {
                centroid[key] = 0;
              }
            }
            centroid['assignedBlogs'].forEach(blog => { // add the values of the blogs to the centroid
              for (let key in blog) {
                if (key === 'Blog') {
                  // do nothing
                } else {
                  centroid[key]+= Number(blog[key]);
                }
              }
            });
            for (let key in centroid) {  // add the average values to the centroid
              if (key === 'assignedBlogs') {
                // do nothing
              } else {
                centroid[key] = centroid[key]/length;
              }
            }
          }
        }
      }
    });
  }
  return centroids;
}
async function getRandomWordCounts(maxCountFromBlogs) {
  let randomValuesForBlogs = []
  for (let key in maxCountFromBlogs) {
    randomValuesForBlogs[key] = (Math.floor(Math.random()*maxCountFromBlogs[key])+1);
  }
  return randomValuesForBlogs;
}


async function getMaxWordCountFromBlogs(n, blogData) {

  let highestValues = [];
  for (const [i, blog] of blogData.entries()) {
    for (let key in blog) {
      if (key === 'Blog' || key === 'previousAssignment') {
        // do nothing
      } else {
        highestValues[key] = 0;
      }
    }
    break;
  }

  for (const [i, blog] of blogData.entries()) {
    if (i === 0) {
      // do nothing
    } else {
      for (let key in blog) {
        if (key === 'Blog'|| key === 'previousAssignment') {
          // do nothing
        } else {
          if (Number(highestValues[key]) < Number(blog[key])) {
            highestValues[key] = Number(blog[key]);
          }
        }
      }
    }
  }
  return highestValues;
}

async function getWordsCount(blogData) {

  for (const [i, blog] of blogData.entries()) {
    return Object.keys(blog).length-1;
  }
}


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
  for (let key in blogA) {
    if (key === 'Blog' || key === 'assignedBlogs' || key === 'previousAssignment') {  //lets pretend there are no blogs called this
      //do nothing
    } else {
      let cntA = Number(blogA[key]);
      let cntB = Number(blogB[key])
      sumA += cntA;
      sumB += cntB;
      sumASq += Math.pow(cntA, 2);
      sumBSq += Math.pow(cntB, 2);
      pSum += cntA * cntB;
    }
  }

  num = pSum - (sumA * sumB / n);
  den = Math.sqrt((sumASq - Math.pow(sumA, 2) / n) * (sumBSq - Math.pow(sumB, 2) / n ));
  let distanceValue = 1.0 - num/den;
  return distanceValue;
}
