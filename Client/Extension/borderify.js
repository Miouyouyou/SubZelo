/* YouTube is at the same time conceived to dynamically load
 * a lot of ressources, and at the same time a fucking pain
 * in the ass to deal with a content script.
 * 
 * First rule : DO NOT CACHE YOUTUBE INFO.
 * You must get everything when you need it, every time.
 * The reason is that if you cache, for example, the video ID.
 * If the user clicks on another video, the new video will loaded
 * inside the previous container, but the extension won't be reloaded,
 * so if you use the cached video ID, you'll have the wrong ID !
 * The cached ID will be from the previous video !
 * 
 * I have no idea how to catch the various YouTube refresh
 * triggers in a simple way.
 * 
 * So, for the moment, don't cache. Scanning the whole DOM Tree
 * every time might induce some performance hits but, at least,
 * we'll avoid a few issues like "outdated information".
 */

function main() {

	var subtitle_box = document.createElement("div");
	var subtitle_flag_select = document.createElement("select");
	var subtitle_input = document.createElement("textarea");
	var subtitles = {};

	console.log("Fired !");

	subtitle_box.id         = "myy_subtitle_editor";
	subtitle_flag_select.id = "myy_subtitle_lang";
	subtitle_input.id       = "myy_subtitle_entry";

	function subtitle_lang() {
		return subtitle_flag_select.value;
	}
	function subtitle_value() {
		return subtitle_input.value;
	}
	function subtitle_input_clear(input) {
		input.value = "";
	}
	function video_time() {
		return document.querySelector("video.html5-main-video").currentTime;
	}

	function video_id_on_youtube_com(url) {
		/* The URL will be either :
		 * https://www.youtube.com/watch?v=TheVideoID
		 * or
		 * http://youtube.com/watch?v=TheVideoID&list=OtherParameters
		 * or even maybe
		 * http://youtube.com/watch?list=fezfezfez&v=TheVideoID
		 * 
		 * So we split at the '?', which will give :
		 * ["https://www.youtube.com/watch", "v=TheVideoID"]
		 * ["http://youtube.com/watch", "v=TheVideoID&list=OtherParameters"]
		 * ["http://youtube.com/watch", "list=fezfezfez&v=TheVideoID"]
		 * 
		 * Then we take the second argument and split it at "v=",
		 * which gives :
		 * ["", "TheVideoID"]
		 * ["", "TheVideoID&list=OtherParameters"]
		 * ["list=fezfezfez&", "TheVideoID"]
		 * 
		 * Then we take the second argument again and split it at '&' this time,
		 * giving :
		 * ["TheVideoID", ""],
		 * ["TheVideoID", "list=OtherParameters"],
		 * ["TheVideoID", ""]
		 * 
		 * Then we take the first argument and return it
		 */
		return url.split("?")[1].split("v=")[1].split("&")[0];
		/* We would take it from some elements but the URL scheme
		 * suffered from less changes other the years, than the design.
		 */
	}

	function video_id_on_youtu_be(current_url) {
		/* https://youtu.be/TheVideoID
		 * https://youtu.be/TheVideoID?t=432
		 * 
		 * -> First split
		 * ["https://", "TheVideoID"],
		 * ["https://", "TheVideoID?t=432"]
		 * 
		 * -> Second split
		 * ["TheVideoID", ""],
		 * ["TheVideoID", "t=432"]
		 * 
		 * -> "TheVideoID"
		 */
		return url.split("youtu.be/")[1].split("?")[0];
	}
	function video_id() {
		var current_url = document.location.href;
		var id = "";
		if (current_url.search("youtube.com")) {
			id = video_id_on_youtube_com(current_url);
		}
		else if (current_url.search("youtu.be")) {
			id = video_id_on_youtu_be(current_url);
		}
		/* else id = ""; We already defined it */
		return id;
	}

	function author_id() {
		var channel_url = document.querySelector("ytd-channel-name a").href;
		var splitted_url = channel_url.split("/");
		return splitted_url[splitted_url.length-1].split("?")[0];
	}

	function author_name() {
		return document.querySelector("ytd-channel-name a").text;

	}
	function subtitles_add_record() {
		console.log("Entering add_record");
		var subtitle_start = video_time();
		var subtitle_end   = subtitle_start + 3 /* seconds */;

		/* In order to avoid data loss due to network issues,
		 * we'll save a backlog of translations recorded.
		 * Then :
		 * * we ask the server about the last timestamp sent from
		 *   the client;
		 * * the server answer with the timestamp of  the last
		 *   translation sent;
		 * * we send back all the backlog from this timestamp;
		 *   * if the server answers, everything is ok.
		 *   * if the server does not answer, we restart the
		 *      procedure (ask, get answer, send, ...)
		 * 
		 * This makes the synchronisation protocol easy to
		 * implement.
		 * It's expected that the server can differentiate between
		 * updates sent by each user.
		 * 
		 * The backlog will be stored on the computer with an
		 * API called "Web extension local storage". It's slightly
		 * different from localStorage since it depends on a different
		 * set of permissions, and is not wiped when cleaning up
		 * the navigation history.
		 * 
		 * Understand that the local storage is kind of flat,
		 * in a sense that you it's a big Javascript Object, or
		 * a hash table, with keys and values.
		 * 
		 * The local storage isn't an SQL database, so you
		 * cannot do "searches" easily.
		 * Storing many many keys might lead to issues if you
		 * want to "search" for elements updated before X.
		 * You'll have to retrieve all the keys and values,
		 * and then implement the search yourself.
		 * https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local
		 * 
		 * I'm not kidding, the API is limited to :
		 * - get(), getBytesInUse(), set(key), remove(key), clear()
		 * 
		 * So, storing a tree is tempting, but if you want to
		 * update anything in a big tree, you'll have to
		 * retrieve the full tree, make a small update, and
		 * then save the small tree.
		 * This can be improved by caching the tree and
		 * saving it again on every update, or periodically
		 * (which can lead to data loss in case of forced
		 * shutdown).
		 * 
		 * What we'll do for the moment is :
		 * * Put an ID to every 
		 */
		var object = {
			"protocol": 1,
			"user_id": "",
			"target": "video",
			"site": "youtube",
			"id": video_id(),
			"author_id": author_id(),
			"author_name": author_name(),
			"url": document.location.href,
			"content": {
				"lang": subtitle_lang(),
				"text": subtitle_value(),
				"start": subtitle_start,
				"end": subtitle_end
			}
		};
		
		console.log("Mooh");
		console.log(JSON.stringify(object));
	}

	function subtitle_onchange(event) {
		console.log("Changed !");
		if (event.key == "Enter") {
			console.log("Enter !");
			subtitles_add_record();
			subtitle_input_clear(subtitle_input)
			console.log("Exit...");
		}
	}

	subtitle_input.addEventListener("keyup", subtitle_onchange);

	subtitle_box.appendChild(subtitle_flag_select);
	subtitle_box.appendChild(subtitle_input);
	/* Without that, the added children will overlap on the
	* video title
	*/
	document.getElementById("player-container-outer").appendChild(subtitle_box);

	document.body.getElementsByTagName("ytd-app")[0].style.border = "5px solid purple";

	/*var local_storage = browser.storage.local;
	local_storage.set(
	local_storage.then(items => { console.log(items); }, items => { console.log("Blargh !"); });*/

}


/* The event system to check whether the document is loaded or not
 * is completely broken on YouTube.
 * 
 * Seriously, onLoad, DOMDocumentLoaded and other stupidities just
 * WON'T WORK on async-scripts heavy websites like YouTube.
 * So, instead, we'll do it the good old stupid way :
 * We'll poll until we have everything we need !
 * YAY... !
 */
function check_for_website_requirements(name) {
	var requirements_loaded = false;
	switch(name) {
		case "youtube":
			var dubious_player = document.body.querySelector("ytd-player");
			console.log(dubious_player);
			requirements_loaded =
				document !== undefined &&
				document.body !== undefined &&
				dubious_player !== null &&
				document.querySelector("#player-container-outer") !== null &&
				document.querySelector("ytd-channel-name a") && /* Used to query the channel ID and name */
				dubious_player.querySelector("video") !== null;
		break;
		default:
			requirements_loaded = false;
	}
	console.log(requirements_loaded);
	return requirements_loaded;
}

function wait_for_youtube_requirements() {
	console.log("Checking for requirements...");
	if (false === check_for_website_requirements("youtube")) {
		window.setTimeout(wait_for_youtube_requirements, 5000);
	}
	else {
		console.log("We ARE PREPARED !\n");
		/* This might mean that we are executed from
		 * a timer thread...
		 * ... Let's keep this in mind ...
		 */
		main();
	}
}


wait_for_youtube_requirements();
