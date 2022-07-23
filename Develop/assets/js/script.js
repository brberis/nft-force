// globals
var featured = [
                {name: "Jordan Belfort" , wallet: "0xdbf2445e5049c04cda797dae60ac885e7d79df9d"},
                {name: "Jake Paul" , wallet: "0xfc811061134fa6ccfd22f56cc91bf6450bea2d01"},
                {name: "Snoop Dogg" , wallet: "0xce90a7949bb78892f159f428d0dc23a8e3584d75"},
                {name: "Scotty Sire" , wallet: "0xd0a1454963fb17f427fe744a084facd0ed60a774"},
                {name: "Lil Mayo" , wallet: "0xa582047f7e50acbc8667523e7f62c200709beaed"},
                {name: "Ben Philips" , wallet: "0x53295d7932767839df07eb175ef03a24dcf3c278"},
                {name: "Lord TJ" , wallet: "0xe0b52149724bc363ef60ac785bf03eec029833b8"},
                {name: "Mike Shinoda" , wallet: "0xb55eb9bd32d6ab75d7555192e7a3a7ca0bcd5738"},
                {name: "Oli White" , wallet: "0xe033b12daf37e64d6e664ac5b8eb839ce5b749db"}
              ];     

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
}

// fetch by account
var getNftsByAccount = function(accountAddress) {
  var apiUrl = "https://api.nftport.xyz/v0/accounts/" + accountAddress + "?chain=ethereum";
  fetch(apiUrl, headers).then(function(response) {
    if (response.ok) {
      response.json().then(function(data) {
        console.log(data);
        getByContract(data.nfts);
      });
    } else {
      console.log("error");
    }
  });    
}

getNftsByAccount(account);



// getNfts();
