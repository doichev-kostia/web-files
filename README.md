# Dive deep into Web file system APIs

## Topics

- Streams (Node and Web)
- File System APIs (Node and Web)
- Compression
- Encryption
- Binary Files
- Audio and Video
- WebRTC
- File processing in browser and in node
- Create an avatar uploader
	- upload an image and crop it on the client side✅
	- transform it to a blob and send to the server✅
	- save it to the DB
      - Postgres
      - MongoDB
	- add srcset for different extensions (avif, webp, original)
	- add srcset for different sizes (small, medium, large)
	- add srcset for different resolutions (1x, 2x, 3x)
	- those modifications should be included in the URL and should be implemented on the fly
    - add a cache layer

### Questions:

- How to compress an image in the browser?
	- Canvas
	- What is BitMap?
- How to send a huge file to the browser?
- How to send a huge file to the server?
- Compression on fly
- What is WebRTC? How to use it? What is the UDP?
- File preview in the browser
- Blobs, Buffers, TypedArrays?
- How to work with binary?
- How to store files in the DB?
- Caching, queues, workers, data structures
- Performance
- TextEncoder, TextDecoder
- Random bytes
- DataTransfer object

### Answers:

Blob - Represents a "Binary Large Object", meaning a file-like object of immutable, raw data. a Blob can be read as text
or binary data, or converted into a ReadableStream so its methods can be used for processing the data.
[FileReader](https://developer.mozilla.org/en-US/docs/Web/API/FileReader) - Enables web applications to asynchronously
read the contents of files (or raw data buffers) stored on the
user's computer, using File or Blob objects to specify the file or data to read
URL.createObjectURL() - Creates a URL that can be used to fetch a File or Blob object.
URL.revokeObjectURL() - Releases an existing object URL which was previously created by calling URL.createObjectURL().
DataTransfer - The DataTransfer object is used to hold the data that is being dragged during a drag and drop operation.
It may hold one or more data items, each of one or more data types. For more information about drag and drop.
File - A File object is a specific kind of Blob, and can be used in any context that a Blob can

##### Bitmap

Bitmap (BMP) is an image file format that can be used to create and store computer graphics. A bitmap file displays a
small dots in a pattern that, when viewed from afar, creates an overall image. A bitmap image is a grid made of rows and
columns where a specific cell is given a value that fills it in or leaves it blank, thus creating an image out of the
data
To create a bitmap, an image is broken into the smallest possible units (pixels) and then the color information of each
pixel (color depth) is stored in bits that are mapped out in rows and columns. The complexity of a bitmap image can be
increased by varying the color intensity of each dot or by increasing the number of rows and columns used to create the
image. However, when a user magnifies a bitmap image enough, it eventually becomes pixelated as the dots resolve into
tiny squares of color on a grid.

`createImageBitmap` - global [method](https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap) that creates
an [Image Bitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap)

##### MIME type

A media type (also known as a Multipurpose Internet Mail Extensions or MIME type) indicates the nature and format of a
document, file, or assortment of bytes. MIME types are defined and standardized in IETF's RFC 6838.
A MIME type most commonly consists of just two parts: a type and a subtype, separated by a slash (/) — with no
whitespace between:
`type/subtype`
The type represents the general category into which the data type falls, such as video or text.

The subtype identifies the exact kind of data of the specified type the MIME type represents. For example, for the MIME
type text, the subtype might be plain (plain text), html (HTML source code), or calendar (for iCalendar/.ics) files.


