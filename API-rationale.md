## MediaHost

The use for MediaHost is to send a query like :
Give me all the subs for all the subtitled videos you
have that are hosted on YouTube !

## MediaHostReference

For YouTube, this will be like
```graphql
{ 
  host: YouTube
  reference_id: g4rBl3d_r3F
  audio: { referenced_audio_object }"
}
```

## Actors

This is very generic for a reason. This could be renamed
"SoundSource", but that Actor sounds way cooler.

Actors can be associated to subs to determine the source of audio
subtitled. The source can be a human speaking, a dog barking,
a music playing or some random environmental sound.
Actors represent these sources.

The whole idea is to list all potential actors, let the subtitle
display scripts associate some specific colors and display rules
to the actors ID, or types.

A single Human Actor can, for example, have a specific color
attributed to him/herfor subtitles, making his/her subtitles
easily to identify, even when he's not the main element of the
audio track (interview, colloboration streams, ...).

... I guess I should enforce some default types, but being too
restrictive will force subbers to shoehorn Actors into a
category that does not belong to it.

For example : How do I represent a virtual cat girl played
by a voice generator like Vocaloid, if the only available types
are "Unknown, Animal, Human, Robot, Music, Noise, Environmental" ?
Animal ? Human ? Robot ?
Same question for Jar Jar Binks.

I'll let the site owner and its users decide.

## Media

At first, I wanted to call this "Audio"... but "Media" is more
appropriate. I could also call them "Video", but subtitles can be
provided for "Audio only" media like podcasts.

Media have a "Video" part and an "Audio" part and while the
subtitles mostly target the "Audio", there is still a use for
"Video subtitles", like translating or retranscribing difficult to
read text displayed on the Video.
The distinction help "subtitlers displaying" scripts differentiate
the various subtitle sources and show them accordingly.

Also, Video and Audio are separated so that they can be referenced
individually. The concept of "referencing" to share subtitles between
media seem to be very useful to me. Compilation clips are a staple of
YouTube videos. Using the subtitles of parts referenced in these clips
is, IMHO, way better than having to recreate them (or worst, waiting
for someone to recreate/copy them).
Some of these clips might show some parts of a "Video", while covering
the "Audio" with unrelated sounds, so separating the two streams are
also essential for referencing purposes.

The Media got an ID, an overall length and have direct "Audio" and
"Video" elements associated to it.
The... whole array thing might just be overkill. While video with
multiple audio tracks actually exist, they are not *THAT* common
(This only targets DVD and BluRays...) and I've rarely seen multiiple
video tracks attached to a single media... (Multi-angle shots DVD are
a rare sight, given how gimmicky the feature was).
So I'm keeping the whole "Array" architecture, because I might be
overlooking some nice feature and it make things easy to evolve...
Still, these could be reduced to single objects.

The length field is not that useful and might be removed in the
future. It's added "just in case it could be useful".

> Every `length` field in the following objects can be -1 if these
> were not determined, which can be the case for media being still
> streamed at the time (e.g. : Live streams).
> Consider negative values as "unknown" and be sure to deal with
> NaN correctly, in case the server were to send weird results.

```c
if (length > 0.0) {
	// deal with known length
}
else {
	// deal with unknown length
}
```

## Lang

Langs are defined using the good old HTML / XML standard. It works,
it's supported everywhere, try to keep it this way.
See this for how to build codes :
https://www.w3.org/International/articles/language-tags/index.en

> Remember, subs != translations.

## Tag

Might not be very useful in the end.

Still, let's avoid having 10 different strings for
the same object, and avoid people creating different tags
when they don't know the orthograph of a word, like for
example : "V-Tubers", "VTubers", "vTubers", ....

Using a Tag object allow subtitlers scripts to list
the available tags and provide some nice autocompletion for the
subtitlers.
This can also allow the subtitle display scripts react
specifically on a tag, without having to do some ridiculously
advanced parsing to manage the 10 different orthographs of a same
element.

Still, nothing prevents people from creating 2000 tags on the
same subject with broken scripts on too welcoming servers. I expect
servers to limit tags creation, merge similar tags into one, and
I expect display scripts to handle "overwhelming" amount of tags by
just ignoring them on such servers.

## Subtitle

### Generic Subtitles fields

#### lang

A Subtitle has multiple Lang. These "Lang" define the Languages
of the text. Meaning the languages spoken by the viewers for which
this subtitle is for.
The reason I choose a list is to allow for language "global"
subtitles and language specific subtitles simultaneously.
For example, global english subtitles will have `["EN"]` as Lang,
and subtitles made for Irish English speaking people and
containing Irish English colloqualism will have `["EN", "EN-IE"]` as
Lang.
This allow subtitlers to provide multiple versions of specific
translation subtitles, in order to provide more natural translations,
while having the rest of the subtitles tagged as "English" (`["EN"]`).
And subtitles display scripts can be configured to only show
subtitles that pertain to some global language, and to some specific
variants only (in our example : "EN" and "EN-IE").

#### text

The text displayed as subtitle.

#### start

The time in seconds, counted from the start of the attached stream,
when the subtitle should start to appear.
Meaning that a subtitle that should appear at 1:30 should read 90.0

#### end

The time in seconds, counted from the start of the attached stream,
when the subtitle should disappear.
Meaning that a subtitle that should disappear at 1:32 should read 92.0
Note to display scripts :
Ignore the subtitles if (!(end > start))
Note that in case you receive a 'NaN', because the server want to
mess with you, (!(end > start)) will still work. Other checks will
fail.

#### tags

As stated above, can be provided by the server to provide additional
arbitrary information.

#### providedby

Provides a hint about who sent this subtitle. This allows subtitles
display scripts to only show the subtitles of specific individuals,
and ignore the garbage sent by other individuals.
Some subtitles might be merged from similar subtitles sent by mutiple
individuals, in which case the list will contain everyone's name...
(In order to avoid needless drama).
It's entirely possible that the server doesn't identify who sent
the subtitles. In which case the list will be empty.

### AudioSubtitle

Captain Obvious speaking here.
An AudioSubtitle is a subtitle that is related to an
audio track.

Wow !

This differentiates itself from `VideoSubtitle` which associate
a sub (a translation most likely) to a part of a video stream
(like some text chat displayed in another language on the screen
for example).

So `AudioSubtitle` is only for audio. Don't abuse it for anything
else. If you do, ninja hamsters will cut the cables of your computers
(and your chargers).

`AudioSubtitle` only have one `target`.

The points behind `actors` (and the reason `Actor` was created in the
first place) is to help subtitles display scripts.
Let's say that multiple people are speaking at the same time.
Let's say that there names are **John**, **David** and **Vincent**.
Let's say that you create a single `AudioSubtitle` for each one.
Now, the subtitle displaying script receive the subtitles.
If there's no 'actor' on each subtitle, and no other information
are provided for differentation, the display script will be unable to
differentiate which subtitle is for who, and will just display
them with the same aspect simultaneously.
As a viewer, it's a real nightmare because I know what is being
said, since there are subtitles, but I can't really tell who's
saying what, since there's no way to tell which subtitle is for who !
Now, sure, you can put "John: ..." in the subtitle for **John**,
"David: ..." in the subtitle for **David** and "Vincent: ..." for
**Vincent**, etc.; in order to differentiate them.
But if you associate an `Actor` to it, the subtitle display
script can reserve a unique color for each Actor and
display each Actor subtitle with this color, making things
easier for the viewer !
This is a standard FanSubber technique and it works very well.

Still, `actors` can be empty.

### VideoSubtitle

`VideoSubtitle` targets a specified part of a Video during a specified
period of time, counted from the beginning of the associated
stream.

Actors are not "required" on Video subtitles.
If the subtitle is just a translation for a building name, the whole
'Actor' thing will be irrelevant.
You can put one if you want though, to translate some text chat from a
known Actor.
This information can be catched by the subtitle display script to show
the subtitle with the right color.

## AudioSubtitleTask

This is used for "stamping" a video. Basically, get a few
suckers^Wmonkeys^Wusers stamp each dialogue part to sub,
and then have subtitlers put subtitles in these range.
This help "split the tasks" between multiple subbers.

Subbing a 6h stream being a titanesque task, and some people
(like VTubers for example) outputting such streams each day,
some cooperation is welcome. In an attempt for such cooperation,
the idea is to have people stamp the start and end of each
dialogue, and have subtitlers (Workers) start generating
subtitles for these parts.

So, when people are watching the streams, but can't sub
(because they don't the language, or just want to enjoy the
stream), they can still press a button to mark each dialogue
start and end, and then wait for subtitlers to take the tasks
afterwards (or ASAP).

So, an AudioSubtitleTask can have zero 'subtitles', in which
case it's a open task, or have already available subtitles,
in which case the Task has been fulfilled, but you could still
provide better subtitles, or subtitles for another language.

A few notes about that, a dialogue of 5 seconds can easily
have TONS of sentences. The first reason being multiple
people speaking at the same time (collab video, for example).
The second being "chatter boxes" speakers that can output
several sentences in less than 5 seconds.

In both case, a single AudioSubtitleTask could contain
several subtitles. So there isn't an automatic 1:1 between
an AudioSubtitleTask and an AudioSubtitle.

Also, deleting an AudioSubtitleTask should not delete the
Subtitles referencing it.
AudioSubtitleTask are just a bonus, not a requirement.
The viewers only care about the subtitles.

Actors were added to help indicate who's speaking in these
segments. It's a little help for subbers, in order to
automatically fill the "actor" field of Subtitles (which
is not required per se).
