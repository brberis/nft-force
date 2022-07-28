// globals
var nfts = 50; // max fetchs of nfts 
var nftOnHome = 8 // nft to display in homepage
var apiKey = "64ca22d3-4e46-460a-908c-6a898d383d17"
var numberFormatter = Intl.NumberFormat('en-US');

var featured = [
                {name: "Jake Paul" , wallet: "0xd81e1713C99595Ee29498e521B18491aF9C60415"},
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
var source;
var headers = {
                headers: {
                  'Authorization': apiKey,
                  'Content-Type': 'application/json'
                  }
              }
var favorites = localStorage.getItem("favorites");
if (!favorites){
  favorites = [];
}else{
  favorites = JSON.parse(favorites);
}

// query selectors
var heroSectionEl = document.querySelector("#hero");
var heroBodyEl = document.querySelector(".hero-body");
var mainSectionEl = document.querySelector("#home");
var famousNftDivMenuEl =  document.querySelector("#famous");
var gallerySectionEl = document.querySelector("#nft-gallery");
var mintBtnEl = document.querySelector("#mint-btn");
var searchFormEl = document.querySelector("#search-form");
var nftInputEl = document.querySelector("#search");
var ethPEl = document.querySelector("#eth");

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

// ethereum price
var coinApiUrl = "https://api.coinbase.com/v2/prices/ETH-USD/spot";
fetch(coinApiUrl, headers).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        var etherPrice = Math.round(data.data.amount);
        etherPrice = numberFormatter.format(etherPrice);
        ethPEl.textContent = "$" + etherPrice;
      });
    }
  });

// validate ethereum address
function validateInputAddress(address) {
  return (/^(0x){1}[0-9a-fA-F]{40}$/i.test(address));
}

// validate image url
function validateImageUrl(url) {
  return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

// nft search handler
var formSubmitHandler = function(event) {
  event.preventDefault();
  // get value from input element
  var nftData = nftInputEl.value.trim();
  if (validateInputAddress(nftData)) {
    window.location.replace("./index.html?wallet=" + nftData);
  } else if (validateImageUrl(nftData)) {
    window.location.replace("./index.html?image=" + nftData);
  } else if (nftData) {
    window.location.replace("./index.html?search=" + nftData);
  } else {
    nftInputEl.setAttribute("placeholder", "Please enter a string")
    nftInputEl.classList.add("required", "placeholder-alert");
    nftInputEl.focus()
  }
};


// famous nft menu  
var aMenuEl = [];
for (let i = 0; i < featured.length; i++) {
  aMenuEl[i] = document.createElement("a");
  aMenuEl[i].classList.add("navbar-item");
  aMenuEl[i].href = "./index.html?wallet=" + featured[i].wallet;
  aMenuEl[i].textContent = featured[i].name;
  famousNftDivMenuEl.appendChild(aMenuEl[i]);
}

// display alerts
var showAlert = function(visible, alert, style){
  if (visible) {
    var alertDivEl = document.createElement("div");
    alertDivEl.classList.add("notification", "is-light", style);
    alertDivEl.textContent = alert;
    mainSectionEl.insertBefore(alertDivEl, gallerySectionEl);
  } else if (document.contains(document.querySelector(".notification"))) {
    document.querySelector(".notification").remove();
  }
}

// search nft into ethereum 
var searchNfts = function(search) {
  loadingMintBtn(true);
  if (source === "from_image"){
    var apiUrl = "https://api.nftport.xyz/v0/recommendations/similar_nfts/urls";
    headers = {
                "method": "POST",
                "headers": {
                  "Content-Type": "application/json",
                  "Authorization": apiKey
                },
                "body": "{\"url\":\"" + search + "\",\"page_number\":1,\"page_size\":50}"
              }
  } else {
    var apiUrl = "https://api.nftport.xyz/v0/search?text=" + search;
  }
  fetch(apiUrl, headers).then(function(response) {
      // request was successful
      if (response.ok) {
        response.json().then(function(data) {
          if (source === "from_image") {
            var results = data.nfts;
          }else{
            var results = data.search_results;
          }
          for (let i = 0; i < results.length; i++) {
            if (!thumbs.includes(results[i].cached_file_url)) {
              createNftElements(results[i], source);
              thumbs.push(results[i].cached_file_url);
            }
          }
          loadingMintBtn(false);
          thumbs = [];
        });
      } else {
        loadingMintBtn(false);
        showAlert(true, "Your search returned no results.", "is-warning");
      }
    });
}

// fetch last 50 minted ntfs contract_addresses
var getNfts = function() {
  loadingMintBtn(true);
  var apiUrl = "https://api.nftport.xyz/v0/nfts?chain=ethereum";
  fetch(apiUrl, headers).then(function(response) {
      // request was successful
      if (response.ok) {
        response.json().then(function(data) {
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
        loadingMintBtn(false);
        showAlert(true, "Error with the server.", "is-warning");
      }
    });
}

// display favorites
var displayFavorites = function() {
  loadingMintBtn(true);
  if (favorites.length == 0) {
    showAlert(true, "You don't have favorites yet. Start clicking the hearts! ", "is-info");
  }
  for (let i = 0; i < favorites.length; i++) {
    nftLoop = setTimeout(function() {  
      thumb = getNftDetails(favorites[i].address, favorites[i].token, false);
      if (i === (favorites.length - 1)){
        loadingMintBtn(false);
      }
    }, i * 1000);

  }
  thumbs = [];
}

// fetch by contract addresses and token id
var getNftDetails = function(contracAddress, tokenId, detail) {
  var apiUrl = "https://api.nftport.xyz/v0/nfts/" + contracAddress + "/" + tokenId + "?chain=ethereum";
  fetch(apiUrl, headers).then(function(response) {
    // request was successful
    if (response.ok) {
      response.json().then(function(data) {
        if(detail){
          displayNftDetails(data);
        }else{
          if (!thumbs.includes(data.nft.cached_file_url)) {
            createNftElements(data, source);
            thumbs.push(data.nft.cached_file_url);
          }
        }
      });
    } else {
      throw new Error(response.status);
    }
  }).catch(function(e){ 
    console.error("This NFTs with this address could not be found. -Server side error.");
  });
}

// fetch by account
var getNftsByAccount = function(accountAddress) {
  loadingMintBtn(true);
  var apiUrl = "https://api.nftport.xyz/v0/accounts/" + accountAddress + "?chain=ethereum";
  fetch(apiUrl, headers).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        for (let i = 0; i < data.nfts.length; i++) {
          setTimeout(function() { 
            getNftDetails(data.nfts[i].contract_address, data.nfts[i].token_id);
          }, i * 1000)
        }
      });
    } else {
      throw new Error(response.status);
    }
  }).catch(function(){
    loadingMintBtn(false);
    console.console.log('404 Not Found');
  });  
}

var isImage = function (url) {
  return /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url); //svg is out
}

// display nfts 
var createNftElements = function (data, source) {
  var name = null;
  if (!source || source == "my_favorites" || source == "from_wallet") {
    var thumb = data.nft.cached_file_url;
    var address = data.nft.contract_address;
    var tokenId = data.nft.token_id;
    if (data.nft.metadata){
      name = data.nft.metadata.name;
    }
    if (!name) {
      name = data.contract.name;
    }
  } else if (source == "from_search" || source == "from_image"){
    var thumb = data.cached_file_url;
    var address = data.contract_address
    var tokenId = data.token_id;
    name = data.name;
  } 

  var isFavorite = favorites.findIndex(
    i => i.address === address &&
    i.token === tokenId);

  if (isImage(thumb) && viewableNft < nftOnHome){
    var nftDivEl = document.createElement("div");
    nftDivEl.classList.add("box");
    var aNftEl = document.createElement("a");
    aNftEl.href = "./index.html?contract-address=" + address + "&tokenid=" + tokenId;
    var nftImgEl = document.createElement("img");
    nftImgEl.src = thumb;
    var descDivEl = document.createElement("div");
    descDivEl.classList.add("thumb-descr", "is-flex");
    var nameSpanEl = document.createElement("span");
    nameSpanEl.classList.add("name");
    nameSpanEl.textContent = name;
    var heartSpanEl = document.createElement("span");
    heartSpanEl.classList.add("heart");
    if (isFavorite >= 0){
      heartSpanEl.innerHTML = "<i onclick='favoriteNftHandler(this)' class='fa fa-heart unloved loved' data-address=" + address + " data-token=" + tokenId + "></i>"
    }else{
      heartSpanEl.innerHTML = "<i onclick='favoriteNftHandler(this)' class='fa fa-heart unloved' data-address=" + address + " data-token=" + tokenId + "></i>"
    }
    aNftEl.appendChild(nftImgEl);
    nftDivEl.appendChild(aNftEl);
    descDivEl.appendChild(nameSpanEl);
    descDivEl.appendChild(heartSpanEl);
    nftDivEl.appendChild(descDivEl);
    gallerySectionEl.appendChild(nftDivEl);
    viewableNft++;
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
  if (source === "from_search" || source === "from_image") { 
    heroBodyEl.classList.add("hero-body-section");
    heroSectionEl.classList.toggle("hero-section");
    heroBodyEl.innerHTML =  '<form id="search-form" class="field has-addons search-section-align">' +
    '<div class="control">' +
    '<input id="search" name="search" class="input" type="text" placeholder="Enter wallet, name or description.">' +
    '</div>' +
    '<div class="control">' +
    '<button type="submit" class="button is-info">' +
      'Search' +
    '</button>' +
    '</div>' +
    '<div id="drop" class="layout-column twelve" ondrop="drop(event)" ondragover="return false">Drop a NFT here!</div>' +
    '</form>';

    var dropbox = document.getElementById('drop');
    dropbox.addEventListener('drop', drop, false);
  }
}


// drag and drop image
function drop(event) {
  console.log(event);
    event.stopPropagation();
    event.preventDefault(); 
    var imageUrl = event.dataTransfer.getData('text/html');
    var rex = /src="?([^"\s]+)"?\s*/;
    var droppedImageUrl;
    droppedImageUrl = rex.exec(imageUrl);
    try {
      if (droppedImageUrl[1]) {
        window.location.replace("./index.html?image=" + droppedImageUrl[1]);
      }    
    }
    catch(err) {
      return
    }
}


// find famous in wallets object
var findFamous = function(walletParam){
  var isFamous = false;
  for(var address in featured) {
    if(featured[address].wallet === walletParam) {
      addSectionTitle(featured[address].name);
      isFamous = true;
    }
  }
  if (!isFamous) {
    addSectionTitle("Wallet: "+ walletParam);
  }

}

// loading mint button
var loadingMintBtn = function(state){
  if (state === true) {
    mintBtnEl.classList.add("is-loading");
  }else{
    mintBtnEl.classList.remove("is-loading");
  }
}

// favorite nft handler
function favoriteNftHandler(x) {
  var address = x.getAttribute("data-address");
  var tokenId = x.getAttribute("data-token");
  var heart = x.getAttribute("class");
  heart = heart.split(" ");
  if (heart[heart.length-1] === "unloved"){
    var lovedNft = {"address": address, "token": tokenId};
    favorites.push(lovedNft);
  }else{
    var index = favorites.findIndex(
        i => i.address === address &&
        i.token === tokenId);
    favorites.splice(index, 1);
  }
  localStorage.setItem("favorites", JSON.stringify(favorites));
  x.classList.toggle("loved");

}

// query parameters
var params = (new URL(document.location)).searchParams;
var recentParam = params.get("recent");
var searchParam = params.get("search");
var imageParam = params.get("image");
var walletParam = params.get("wallet");
var favoritesParam = params.get("favorites");
var contracAddressParam = params.get("contract-address");
var tokenIdParam = params.get("tokenid");

// routing
if (walletParam) {
  nftOnHome = nfts;
  source = "from_wallet";
  changeHero("section");
  findFamous(walletParam);
  getNftsByAccount(walletParam);
}

if (contracAddressParam && tokenIdParam){
  changeHero("section");
  getNftDetails(contracAddressParam, tokenIdParam, true);
}

if (searchParam) {
  nftOnHome = nfts;
  source = "from_search";
  changeHero("section");
  addSectionTitle("Search results");
  searchNfts(searchParam);
}

if (imageParam) {
  nftOnHome = nfts;
  source = "from_image";
  changeHero("section");
  addSectionTitle("Search results");
  searchNfts(imageParam);
}

if (recentParam == 1) {
  nftOnHome = nfts;
  changeHero("section");
  addSectionTitle("Last Minted NFTs");
  getNfts();
}

if (favoritesParam == 1) {
  nftOnHome = nfts;
  source = "my_favorites";
  changeHero("section");
  addSectionTitle("My Favorites");
  displayFavorites();
}

if (!walletParam && !recentParam && !contracAddressParam && !searchParam && !favoritesParam && !imageParam) {
  source = "from_search";
  changeHero("hero");
  searchNfts("famous");
}

searchFormEl.addEventListener("submit", formSubmitHandler);