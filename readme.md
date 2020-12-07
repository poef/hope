# Hope is an alternative to markup languages.

**Note: this project is superceded by [cobalt](https://github.com/poef/cobalt)**

It is currently a proof of concept prototype to see where the ideas of Ted Nelson can lead us.

Ted Nelson came up with the term Hypertext and famously defined 17 rules that a Hypertext system should conform to. His attempts to implement these in his Xanadu system haven't resulted in a finished system. But what if it had?

Hope is an attempt to implement one small part of Ted's Xanadu dream: out-of-line markup. Instead of mixing the markup with the content, Hope keeps them rigorously apart. The content is nothing more than plain-text. The markup is in a seperate text file, only referencing the content using character ranges.

The immediate goal is to build a wysiwyg editor to edit a hope fragment, because it is impossible to keep two files in sync using a normal text editor.

To keep the problem as simple as possible, I'm building this as a web application. This allows me to focus only on the markup and text, leaving rendering and styling to the browser. 

If you are interested in researching this concept, grab the code from github and start experimenting.

## Todo

- normalize annotation fragments automatically
- improve html rendering
- add toolbars
- add common commands
- add undo/redo
- create a web component for the editor
- build all operations from Core Range Algebra into hope.range.js
- allow markup that references the whole document, not a range
- allow range sequences in an annotation
- allow insertion points instead of a range in an annotation
- remove dependency on contenteditable for cursor handling
- allow overlapping links
- allow multiple annotation sets/fragments
- create server-side storage with version support and full set of insertions/deletions between revisions
- implement transclusion

## Issues

- No support for tags like <img> that don't enclose text
- html rendering is incorrect

## Similar projects
There is a relatively large interest for out-of-line markup, but it is generally trying to solve a different problem and usually uses an xml or html document as the source document to annotate. You can find these using the search terms 'standoff markup', 'parallel markup' or 'out-of-line markup'.

The ones that come closest to Hope are:
- [Ool - Out-of-line XML](http://simonstl.com/projects/ool/)
- [Multi-Version Documents](http://multiversiondocs.blogspot.nl/)

#Goals / Hopes
I've been writing web software, frontend and backend since 1995 and I found that some problems haven't gone away.The most obvious one is security, e.g. Cross-Site Scripting attacks (XSS). But some problems have only grown. The entire knowledge stack needed to write web applications today is vastly more expansive and complex than in 1995, or even 2001. No browser even attempts to fully implement the current standards, or even fix bugs in years old modules. Worse the standard itself is years in the making, not just because of politics but also because of the inherent complexity of it.

What the web needs is not mode high-level constructs and api's, but less. Web browsers shouldn't be trying to be full operating systems /and/ all services in one monolythic application.

Take the contenteditable/designMode feature of modern browsers. Not only is the API high-level, without access to lower level abstractions. The implementation varies wildly across browsers, with numerous bugs and misfeatures. Simple extensions require writing hairy, hacky, complex code. 

My hope is that hope will show that most of that complexity isn't needed, if the data type you are operating on is inherently less complex. So far, it looks like this might in fact be true. 

#References
- [Core Range Algebra](http://conferences.idealliance.org/extreme/html/2002/Nicol01/EML2002Nicol01.html)
- [Embedded Markup Considered Harmfull](http://www.xml.com/pub/a/w3j/s3.nelson.html)
- [Xanalogical Media: Needed Now More Than Ever](http://www.xanadu.net/NOWMORETHANEVER/XuSum99.html)

