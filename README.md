# speechDown

This is a speech to text and text to speech app. It is designed to have a minimal interface and to be as simple as possible to use. It has the following features:

- Speech to text dictation functionality using vosk.
- Text to speech functionality using Google text to speech.
- Optical character recognition using Tesseract.
-  Mark down preview using Marked.


<div>
<img style="width:40%; margin-bottom:1rem;" src="https://github.com/MaxAFriedrich/speechDown/raw/master/screenshots/dark_theme_both_pannels.jpg" referrerpolicy="no-referrer" alt="Screenshot">
<img style="width:40%; margin-bottom:1rem;" src="https://github.com/MaxAFriedrich/speechDown/raw/master/screenshots/dark_theme_code_pannel.jpg" referrerpolicy="no-referrer" alt="Screenshot">
<img style="width:40%; margin-bottom:1rem;" src="https://github.com/MaxAFriedrich/speechDown/raw/master/screenshots/dark_theme_preview_pannel.jpg" referrerpolicy="no-referrer" alt="Screenshot">
<img style="width:40%; margin-bottom:1rem;" src="https://github.com/MaxAFriedrich/speechDown/raw/master/screenshots/dark_theme_settings.jpg" referrerpolicy="no-referrer" alt="Screenshot">
<img style="width:40%; margin-bottom:1rem;" src="https://github.com/MaxAFriedrich/speechDown/raw/master/screenshots/light_theme_both_pannels.jpg" referrerpolicy="no-referrer" alt="Screenshot">
</div>

## Compatibility

This app is only available on MacOS Linux and Windows.  With x86-64 CPU and as much RAM and as much CPU performance as possible.

## Installation

*Currently there are no pre-Built packages, however this will change in the future.*

In order to install this up you can clone this repository and make sure that nodeJS is installed.

You can do this using the following commands:
``` bash
git clone https://github.com/MaxAFriedrich/speechDown
npm install
npm start
```

In order to then use this app you can simply run `npm start` in the root of the repository. You may wish to create a shortcut for this.


### Setting up Google text to speech

To use Google text to speech you need to set it up using the Google cloud platform. Here are some instructions on how to do this, which you also find in the app itself.


> To use this app's text to speech capability, you need to set up authentication so this app can use Google Text-to-Speech. You can find instructions on how to do this [here](cloud.google.com/text-to-speech/docs/before-you-begin#setting_up_your_google_cloud_platform_project).
> **NOTE: Do not "Set your authentication environment variable".**
> Once you have completed this, tell this app where you have stored the JSON file you downloaded is.

## Usage

Here are some general point is on the best way to use this software.

-  You can only read scan or edit text in the code panel.
-  The preview panel can only preview text and has no editing capabilities whatsoever.  

### Controls

Once you have opened the app all of the controls are along the top of the screen.

| Control                                                      | Shortcut            | Function                                         |
| ------------------------------------------------------------ | ------------------- | ------------------------------------------------ |
| Save ![Save](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/save_white_24dp.svg) | <kbd>Ctrl + S</kbd> | Save the current file.                           |
| Open![Open](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/file_open_white_24dp.svg) | <kbd>Ctrl + O</kbd> | Open a new file.                                 |
| New File ![New File](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/note_add_white_24dp.svg) | <kbd>Ctrl + N</kbd> | Create a new file.                               |
| Settings![Settings](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/settings_white_24dp.svg) | <kbd>Ctrl + ,</kbd> | Open the settings.                               |
| Dictate![Dictate](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/keyboard_voice_white_24dp.svg) | <kbd>Ctrl + D</kbd> | Dictate some text.                               |
| Scan![Scan](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/document_scanner_white_24dp.svg) | <kbd>Ctrl + E</kbd> | Scan a image to text.                            |
| Read![Read](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/volume_up_white_24dp.svg) | <kbd>Ctrl + R</kbd> | Read some text out.                              |
| Code View![Code View](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/code_white_24dp.svg) | <kbd>Ctrl + 1</kbd> | View just the markdown code.                     |
| View code and preview![Code and preview](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/view_agenda_white_24dp.svg) | <kbd>Ctrl + 2</kbd> | View both the markdown and code.                 |
| Preview only![preview only](https://raw.githubusercontent.com/MaxAFriedrich/speechDown/master/render/svg/preview_white_24dp.svg) | <kbd>Ctrl + 3</kbd> | View just a html render preview of the markdown. |
