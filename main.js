const URL_REGEX = new RegExp('github\.com/(.*?)/(.*?)/');


function loadCache(key) {
	return JSON.parse(sessionStorage.getItem(key));
}


function setCache(key, value) {
	sessionStorage.setItem(key, JSON.stringify(value));
}


function fetchReleases(user, repo) {
	return window.fetch(`https://api.github.com/repos/${user}/${repo}/releases`)
		.then(res => res.json())
		.catch(err => console.error(`Error fetching GitHub releases: ${err}`));
}


function createDownloadMap(releases) {
	const downloadMap = {};
	releases.forEach((release) => {
		const { assets } = release;
		assets.forEach((asset) => {
			const assetUrlRel = asset.browser_download_url.substring(18);
			downloadMap[assetUrlRel] = asset.download_count;
		});
	});
	return downloadMap;
}


function insertDownloadCounts(downloadMap) {
	const repoContent = document.getElementsByClassName('repository-content')[0];
	const links = repoContent.getElementsByTagName('a');

	for (let link of links) {
		const assetUrl = link.getAttribute('href');
		if (assetUrl in downloadMap) {
			const downloadsElement = document.createElement('small');
			downloadsElement.innerText = `${downloadMap[assetUrl]} downloads`;
			downloadsElement.className = 'text-gray flex-shrink-0 ml-3';
			link.appendChild(downloadsElement);
		}
	}
}


async function main() {
	// Extract repository owner and name
	const currentUrl = window.location.href;
	const matches = currentUrl.match(URL_REGEX);
	const user = matches[1];
	const repo = matches[2];

	// Load cached releases from sessionStorage (if entry exists)
	const cacheKey = `releases-${user}-${repo}`;
	const cache = loadCache(cacheKey);

	let releases;
	if (cache === null) {
		// Fetch releases from GitHub API
		releases = await fetchReleases(user, repo);
		setCache(cacheKey, releases);
	} else {
		// Use releases from cache
		releases = cache;
	}

	// Add download counts to release assets
	const downloadMap = createDownloadMap(releases);
	insertDownloadCounts(downloadMap);
}


main();
