**THIS PROJECT IS UNUSABLE IN ITS CURRENT STATE**

About
-----

The main purpose is to build a light infrastructure allowing people
to add, publish and view subtitles for individual videos present on
various video hosts.  
The first use for this infrastructure is to provide translations
subtitles for VTubers videos published on YouTube, Nicovideo and
BiriBiri.

This is aimed to be generic enough for usage with various other
means.

The infrastructure is to be split between :

* A file format for Subtitles archives
* Subtitles viewers (mostly WebExtensions) able to retrieve the
  archives and show the stored subtitles
* An API allowing smooth cooperation when subtitling in groups
  (markers, subtitlers, QA, ...), along with a server implementation
  deployable through Docker.

The main design principle is :

* The infrastructure has be to be built AROUND the videos.
  Meaning no copy of the video at any time. The subtitlers viewers
  have to overlay the subtitles on top of a video played through
  normal means (e.g. : viewing the video on YouTube using their
  favorite browser).
