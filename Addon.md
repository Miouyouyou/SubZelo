# The addon dillema

## How to make a tracker

So, if you create an addon to retrieve subs for videos and show
them when the user is playing them... How do you retrieve the
subs in the first place ?

One answer would be : That's easy ! For each video, contact the
server and ask him to provide you subs for this video. If it
got no subs, it will send and empty response, and if it got
any subs, display them at the right moment.

Well... this is how you transform a nice idea into a tracker !
Since you're sending to the server the URL of every video you're
watching, in order to get subs for it, the server knows your
entire watching history !
Which, IMHO, is TERRIBLE ! People just want subs. They don't
want to get tracked by some creepy websites !

## How to avoid making a tracker

So, another way to do it is to synchronize with a server and
ask him about all the subs for all the videos he got, and then
let the add-on store these information and use them to display
the right subs at the right time, when the user display a
video it got subs for.

Now, the client don't have to send his entire history to some
random server.

This might make the charge higher for the server. However, the
this can be mitigated by just generating snapshots of the entire
database at fixed intervals. Upload those snapshots on any file
server that can handle high traffic, let the clients get them
from there and you're good to go.

If you want real time subtitles update, for live streams for
example, a WebSocket + Pub/Sub interface will, IMHO, be WAY
better than polling a server for updates, anyway.
So I'm going with the "big sync" concept. It's easy, can
be made quite lightweight and it makes the addon
"privacy friendly".
