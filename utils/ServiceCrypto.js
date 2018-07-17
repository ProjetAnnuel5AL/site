var crypto = require("crypto");

var ServiceCrypto=function(){
	this.keyhex = "8479769f48481eeb9c8304de0a58481eeb9c8104ce0a5e3cb5e3cb59479768f1";
	this.blockSize = 16;
};

ServiceCrypto.prototype.encryptAES = function(input) {
	try {
		var iv = require('crypto').randomBytes(16);
		//console.info('iv',iv);
		var data = new Buffer(input).toString('binary');
		//console.info('data',data);
		
		key = new Buffer(this.keyhex, "hex");
		//console.info(key);
		var cipher = require('crypto').createCipheriv('aes-256-cbc', key, iv);
		// UPDATE: crypto changed in v0.10

		// https://github.com/joyent/node/wiki/Api-changes-between-v0.8-and-v0.10 

		var nodev = process.version.match(/^v(\d+)\.(\d+)/);

		var encrypted;

		if( nodev[1] === '0' && parseInt(nodev[2]) < 10) {
			encrypted = cipher.update(data, 'binary') + cipher.final('binary');
		} else {
			encrypted =  cipher.update(data, 'utf8', 'binary') +  cipher.final('binary');
		}

		var encoded = new Buffer(iv, 'binary').toString('hex') + new Buffer(encrypted, 'binary').toString('hex');

		return encoded;
	} catch (ex) {
	  // handle error
	  // most likely, entropy sources are drained
	  console.error(ex);
	}
};

ServiceCrypto.prototype.decryptAES = function(encoded) { 	
	var combined = new Buffer(encoded, 'hex');		

	key = new Buffer(this.keyhex, "hex");
	
	// Create iv
	var iv = new Buffer(16);
	
	combined.copy(iv, 0, 0, 16);
	edata = combined.slice(16).toString('binary');

	// Decipher encrypted data
	var decipher = require('crypto').createDecipheriv('aes-256-cbc', key, iv);

	// UPDATE: crypto changed in v0.10
	// https://github.com/joyent/node/wiki/Api-changes-between-v0.8-and-v0.10 

	var nodev = process.version.match(/^v(\d+)\.(\d+)/);

	var decrypted, plaintext;
	if( nodev[1] === '0' && parseInt(nodev[2]) < 10) {  
		decrypted = decipher.update(edata, 'binary') + decipher.final('binary');    
		plaintext = new Buffer(decrypted, 'binary').toString('utf8');
	} else {
		plaintext = (decipher.update(edata, 'binary', 'utf8') + decipher.final('utf8'));
	}
	return plaintext;
};

module.exports=ServiceCrypto;