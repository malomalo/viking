const fs = require('fs');
const path = require('path');
const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const firefoxOptions = new firefox.Options();
// firefoxOptions.headless();

(async () => {
	const driver = await new Builder()
		.forBrowser('firefox')
		.setFirefoxOptions(firefoxOptions)
		.build();

	driver.get(`file://${path.resolve(__dirname, '../../src/test/index.html')}`);
})();
