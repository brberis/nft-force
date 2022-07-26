// globals
var nfts = 20; // max fetchs of nfts 
var nftOnHome = 4 // nft to display in homepage
var featured = [
                {name: "Jordan Belfort" , wallet: "0xdbf2445e5049c04cda797dae60ac885e7d79df9d"},
                {name: "Jake Paul" , wallet: "0xd81e1713C99595Ee29498e521B18491aF9C60415"},
                // {name: "Snoop Dogg" , wallet: "0xce90a7949bb78892f159f428d0dc23a8e3584d75"},
                {name: "Scotty Sire" , wallet: "0xd0a1454963fb17f427fe744a084facd0ed60a774"},
                {name: "Lil Mayo" , wallet: "0xa582047f7e50acbc8667523e7f62c200709beaed"},
                {name: "Ben Philips" , wallet: "0x53295d7932767839df07eb175ef03a24dcf3c278"},
                {name: "Lord TJ" , wallet: "0xe0b52149724bc363ef60ac785bf03eec029833b8"},
                {name: "Mike Shinoda" , wallet: "0xb55eb9bd32d6ab75d7555192e7a3a7ca0bcd5738"},
                {name: "Oli White" , wallet: "0xe033b12daf37e64d6e664ac5b8eb839ce5b749db"}
              ];     
var walletName = null;
var viewableNft = 0;
var thumbs = [];
var token = "64ca22d3-4e46-460a-908c-6a898d383d17";
var headers = {
                headers: {
                  'Authorization': '64ca22d3-4e46-460a-908c-6a898d383d17',
                  'Content-Type': 'application/json'
                  }
              }

// query selectors
var heroSectionEl = document.querySelector("#hero");
var heroBodyEl = document.querySelector(".hero-body");
var famousNftDivMenuEl =  document.querySelector("#famous");
var gallerySectionEl = document.querySelector("#nft-gallery");
var mintBtnEl = document.querySelector("#mint-btn");


// change hero to section
var changeHero = function(type){
  if (type == "hero") {
    heroSectionEl.classList.replace("is-success", "is-link");
    heroSectionEl.classList.remove("hero-section");
  }else{
    heroSectionEl.classList.replace("is-link", "is-success");
    heroSectionEl.classList.add("hero-section");
    heroBodyEl.innerHTML = "";

  }
}

// famous nft menu  
var aMenuEl = [];
for (let i = 0; i < featured.length; i++) {
  aMenuEl[i] = document.createElement("a");
  aMenuEl[i].classList.add("navbar-item");
  aMenuEl[i].href = "./index.html?wallet=" + featured[i].wallet;
  aMenuEl[i].textContent = featured[i].name;
  famousNftDivMenuEl.appendChild(aMenuEl[i]);
}

// fetch last 50 ntfs contract_addresses
var getNfts = function() {
  var apiUrl = "https://api.nftport.xyz/v0/nfts?chain=ethereum";
  fetch(apiUrl, headers).then(function(response) {
      // request was successful
      if (response.ok) {
        response.json().then(function(data) {
          loadingMintBtn(true);
          for (let i = 0; i < nfts; i++) {
            nftLoop = setTimeout(function() {  
              thumb = getNftDetails(data.nfts[i].contract_address, data.nfts[i].token_id, false);
              if (i === (nfts - 1)){
                loadingMintBtn(false);
              }
            }, i * 1000);
          }
          

          thumbs = [];
        });
      } else {
        // if not successful, redirect to homepage
        console.log("error");
      }

    });
}


// fetch by contract_addresses
var getByContract = function(nfts) {
  var lastThumbs = [];
  findFamous(wallet);
  for (let i = 0; i < nfts.length; i++) {
    if (nfts[i]) {
      setTimeout(function() {   
        var apiUrl = "https://api.nftport.xyz/v0/nfts/" + nfts[i].contract_address + "?chain=ethereum&page_size=2&include=metadata";
        fetch(apiUrl, headers).then(function(response) {
          // request was successful
          if (response.ok) {
            response.json().then(function(data) {
              if (!lastThumbs.includes(data.nfts[0].cached_file_url)) {
              console.log(data);
              createNftElementsFromWallet(data);
              }
              lastThumbs.push(data.nfts[0].cached_file_url);
            });
          } else {
            // if not successful, redirect to homepage
            console.log("error");
          }
        });
      }, i * 1000)
    }
  }
}

// fetch by contract_addresses
var getNftDetails = function(contracAddress, tokenId, detail) {
  var apiUrl = "https://api.nftport.xyz/v0/nfts/" + contracAddress + "/" + tokenId + "?chain=ethereum";
  fetch(apiUrl, headers).then(function(response) {
    // request was successful
    if (response.ok) {
      response.json().then(function(data) {
        console.log(data);
        if(detail){
          displayNftDetails(data);
        }else{
          if (!thumbs.includes(data.nft.cached_file_url)) {
            createNftElements(data);
            thumbs.push(data.nft.cached_file_url);
          }
        }
      });
    } else {
      // if not successful, redirect to homepage
      console.log("error");
    }
  });
}

// fetch by account
var getNftsByAccount = function(accountAddress) {
  var apiUrl = "https://api.nftport.xyz/v0/accounts/" + accountAddress + "?chain=ethereum";
  fetch(apiUrl, headers).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        getByContract(data.nfts);
      });
    } else {
      console.log("error");
    }
  });    
}

var isImage = function (url) {
  return /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url); //svg is out
}

// display nfts 
var createNftElements = function (data) {
  var thumb = data.nft.cached_file_url;
  var name = null;
  if (data.nft.metadata){
    name = data.nft.metadata.name;
  }
  if (!name) {
    name = data.contract.name;
  }
  if(isImage(thumb) && viewableNft < nftOnHome){
    console.log("Qty", viewableNft);
    var nftDivEl = document.createElement("div");
    nftDivEl.classList.add("box");
    var aNftEl = document.createElement("a");
    aNftEl.href = "./index.html?contract-address=" + data.nft.contract_address + "&tokenid=" + data.nft.token_id;
    var nftImgEl = document.createElement("img");
    nftImgEl.src = thumb;
    var h4El = document.createElement("h4");
    h4El.textContent = name;
    aNftEl.appendChild(nftImgEl);
    nftDivEl.appendChild(aNftEl);
    nftDivEl.appendChild(h4El);
    gallerySectionEl.appendChild(nftDivEl);
    viewableNft++;
  }
}

// display nfts from wallet
var createNftElementsFromWallet = function (data) {
  var thumb = data.nfts[0].cached_file_url;
  var name = data.nfts[0].metadata.name;
  var gallerySectionEl = document.querySelector("#nft-gallery");

  if (!name) {
    name = data.contract.name;
  }
  if(isImage(thumb)){
    var nftDivEl = document.createElement("div");
    nftDivEl.classList.add("box");
    var aNftEl = document.createElement("a");
    aNftEl.href = "./index.html?contract-address=" + data.nfts[0].contract_address + "&tokenid=" + data.nfts[0].token_id;
    var nftImgEl = document.createElement("img");
    nftImgEl.src = thumb;
    var h4El = document.createElement("h4");
    h4El.textContent = name;
    aNftEl.appendChild(nftImgEl);
    nftDivEl.appendChild(aNftEl);
    nftDivEl.appendChild(h4El);
    gallerySectionEl.appendChild(nftDivEl);
  }

}

// display nft detail
displayNftDetails = function (data) {
  var thumb = data.nft.cached_file_url;
  var name = data.nft.metadata.name;
  var mintDate = data.nft.mint_date;
  var lastUpdate = data.nft.updated_date;
  lastUpdate = moment(lastUpdate, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("MMMM Do YYYY, h:mm:ss a");
  var mintDate = data.nft.mint_date;
  mintDate = moment(mintDate, "YYYY-MM-DDTHH:mm:ss").format("MMMM Do YYYY, h:mm:ss a");
  var chain = data.nft.chain;
  chain = chain.charAt(0).toUpperCase() + chain.slice(1);
  if (!name) {
    name = data.contract.name;
  }
  addSectionTitle(name);
  if(isImage(thumb)){
    gallerySectionEl.classList.add("one-nft");
    var nftDivEl = document.createElement("div");
    nftDivEl.classList.add("box");
    var nftImgEl = document.createElement("img");
    nftImgEl.src = thumb;
    var detailDivEl = document.createElement("div");
    detailDivEl.classList.add("detail");
    var collection = "";
    if(data.nft.metadata.collection) {
      collection = "<p><span class='detail-name'>Collection: </span>" + data.nft.metadata.collection.name + "</p>"; 
    }
    var description = "";
    if(data.nft.metadata.description) {
      description = "<p><span class='detail-name'>Description: </span>" + data.nft.metadata.description + "</p>"; 
    }
    detailDivEl.innerHTML = "<p><span class='detail-name'>Name: </span>" + name + "</p>" + description + collection +
                            "<p><span class='detail-name'>Mint date: </span>" + mintDate + "</p>" +
                            "<p><span class='detail-name'>Last update: </span>" + lastUpdate + "</p>" +
                            "<p><span class='detail-name'>Chain: </span>" + chain + "</p>" +
                            "<p><span class='detail-name'>Owner address: </span>" + data.owner + "</p>";
    nftDivEl.appendChild(nftImgEl);
    nftDivEl.appendChild(detailDivEl);
    gallerySectionEl.appendChild(nftDivEl);
  }

}

// add name in section
var addSectionTitle = function(name){
  var h2El = document.createElement("h2");
  h2El.textContent = name;
  heroBodyEl.appendChild(h2El);
}

// find famous in wallets object
var findFamous = function(wallet){
  for(var address in featured) {
    if(featured[address].wallet === wallet) {
      addSectionTitle(featured[address].name);
    } 
  }
}

// loading mint button
var loadingMintBtn = function(state){
  if (state === true) {
    console.log("is", state);
    mintBtnEl.classList.add("is-loading");
  }else{
    console.log("NOW is", state);
    mintBtnEl.classList.remove("is-loading");
  }
}


// query parameters
var params = (new URL(document.location)).searchParams;
var recent = params.get("recent");
var wallet = params.get("wallet");
var contracAddress = params.get("contract-address");
var tokenId = params.get("tokenid");
if (wallet) {
  changeHero("section");
  getNftsByAccount(wallet);
}
if (contracAddress && tokenId){
  changeHero("section");
  getNftDetails(contracAddress, tokenId, true);
}
if (recent == 1) {
  nftOnHome = nfts;
  changeHero("section");
  addSectionTitle("Last Minted NFTs");
  getNfts();
}
if (params.URLSearchParams === undefined) {
  changeHero("hero");
  getNfts();
  loadingMintBtn(false);
}

