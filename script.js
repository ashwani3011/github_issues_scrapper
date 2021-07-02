const request = require("request");
const cheerio = require("cheerio");
let fs = require("fs");

let data = {};

request("https://github.com/topics", callback);

function callback(error, response, html) {
  if (!error) {
    let manipulationTool = cheerio.load(html);

    let allAnchors = manipulationTool(".no-underline.d-flex.flex-column");
    // console.log(topics.length);

    for (let i = 0; i < allAnchors.length; i++) {
      topicProcessor(
        "https://github.com/" + manipulationTool(allAnchors[i]).attr("href"),
        manipulationTool(manipulationTool(allAnchors[i]).find("p")[0])
          .text()
          .trim()
      );
    }
  }
}

function topicProcessor(url, topicName) {
  request(url, function (err, res, html) {
    let mt = cheerio.load(html);
    let allHeadings = mt(".f3.color-text-secondary.text-normal.lh-condensed");
    allHeadings = allHeadings.slice(0, 5);
    for (let i = 0; i < allHeadings.length; i++) {
      if (!data[topicName]) {
        data[topicName] = [];
        data[topicName].push({
          name: mt(mt(allHeadings[i]).find("a")[1]).text().trim(),
        });
      } else {
        data[topicName].push({
          name: mt(mt(allHeadings[i]).find("a")[1]).text().trim(),
        });
      }

      projectProcessor(
        "https://github.com/" +
          mt(mt(allHeadings[i]).find("a")[1]).attr("href"),
        topicName,
        mt(mt(allHeadings[i]).find("a")[1]).text().trim()
      );
    }
  });
}
function projectProcessor(projectUrl, topicName, projectName) {
  projectUrl = projectUrl + "/issues";
  request(projectUrl, function (err, res, html) {
    let mt = cheerio.load(html);
    let allAnchors = mt(
      ".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title"
    );
    console.log(allAnchors);
    let index = -1;
    for (let j = 0; j < data[topicName].length; j++) {
      if (data[topicName][j].name == projectName) {
        index = j;
        break;
      }
    }

    allAnchors = allAnchors.slice(0, 5);
    for (let i = 0; i < allAnchors.length; i++) {
      let link = "https://github.com/" + mt(allAnchors[i]).attr("href");
      let name = mt(allAnchors[i]).text();

      console.log(link);

      if (!data[topicName][index].issues) {
        data[topicName][index].issues = [];
        data[topicName][index].issues.push({ name, link });
      } else {
        data[topicName][index].issues.push({ name, link });
      }
    }
    fs.writeFileSync("data.json", JSON.stringify(data));
  });
}
