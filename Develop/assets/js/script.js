// globals
var token = "64ca22d3-4e46-460a-908c-6a898d383d17";
var headers = {
  headers: {
    'Authorization': '64ca22d3-4e46-460a-908c-6a898d383d17',
    'Content-Type': 'application/json'
    }
  }

// fetch last 50 ntfs contract_addresses
var getNfts = function() {
  var apiUrl = "https://api.nftport.xyz/v0/nfts?chain=ethereum";

  fetch(apiUrl, headers).then(function(response) {
      // request was successful
      if (response.ok) {
        response.json().then(function(data) {
          console.log(data);
          getByContract(data.nfts);

        });
      } else {
        // if not successful, redirect to homepage
        console.log("error");
      }
    });
}


// fetch by contract_addresses
var getByContract = function(nfts) {

  for (let i = 0; i < 3; i++) {
    setTimeout(function() {   
      var apiUrl = "https://api.nftport.xyz/v0/nfts/" + nfts[i].contract_address + "?chain=ethereum&page_size=2&include=metadata";
      fetch(apiUrl, headers).then(function(response) {
        // request was successful
        if (response.ok) {
          response.json().then(function(data) {
            console.log(data);
            getNftDetails(data);
          });
        } else {
          // if not successful, redirect to homepage
          console.log("error");
        }
      });
    }, i * 1000)
  }
    
}


// fetch by contract_addresses
var getNftDetails = function(nftData) {
var contracAddress = nftData.nfts[0].contract_address;
var tokenId = nftData.nfts[0].token_id;
    // setTimeout(function() {   
      var apiUrl = "https://api.nftport.xyz/v0/nfts/" + contracAddress + "/" + tokenId + "?chain=ethereum";
      fetch(apiUrl, headers).then(function(response) {
        // request was successful
        if (response.ok) {
          response.json().then(function(data) {
            console.log(data);
          });
        } else {
          // if not successful, redirect to homepage
          console.log("error");
        }
      });
    // }, i * 500)
    
}


getNfts();
