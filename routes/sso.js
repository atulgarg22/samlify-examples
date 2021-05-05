// This is /routes/sso.js
var saml = require('samlify');
var express = require('express');
var path = require('path');
var fs = require('fs');
var router = express.Router();

const validator = require('@authenio/samlify-node-xmllint');

// Use samlify
saml.setSchemaValidator(validator);

// Configure your endpoint for IdP-initiated / SP-initiated SSO
const sp = saml.ServiceProvider({
	metadata: fs.readFileSync(path.resolve(__dirname, 'metadata_sp.xml'))
});
// configure the corresponding identity provider
const idp = saml.IdentityProvider({
	metadata: fs.readFileSync(path.resolve(__dirname, 'onelogin_metadata_487043.xml'))
});

// Release the metadata publicly
router.get('/metadata', function(req, res, next) {
	res.header('Content-Type','text/xml').send(sp.getMetadata());
});

// Access URL for implementing SP-init SSO
router.get('/spinitsso-redirect', (req, res) => {
	const { id, context } = sp.createLoginRequest(idp, 'redirect');
	return res.redirect(context);
});

// If your application only supports IdP-initiated SSO, just make this route is enough
router.post('/acs', (req, res, next) => {
	sp.parseLoginResponse(idp, 'post', req)
	.then(parseResult => {

	  // Write your own validation and render function here
	  res.send('Validate the SAML Response successfully !' + JSON.stringify(parseResult));
	})
	.catch(console.error);
  });
  
module.exports = router;