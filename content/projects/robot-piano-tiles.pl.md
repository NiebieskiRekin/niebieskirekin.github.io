+++
title = 'Robot Piano Tiles'
date = 2024-04-10
tags = ["Cpp", "Python", "Arduino", "KiCad"]
categories = ["Embedded", "Studia"]
+++

{{< youtube 5Zbdg9VmfgI >}}

A Piano Tiles (mobile game) hardware autoclicker built on the ATmega328. All electrical sketches and the PCB were designed in [KiCad](https://www.kicad.org/). Code for the microprocessor was written in C++ using Arduino and Servo libraries as well as the [PlatformIO](https://platformio.org/install/ide?install=vscode) VSCode extension.

This project also has a live visualisation Python script that communicates with the main board over serial to display data captured by the photoresistor module. This script can also be used to quickly adjust some parameters at the start of runtime.

This repository was created for a university group project for [RoboDay 2024](https://www.facebook.com/events/1518830758974874) at Poznań University of Technology.
Made by: Tomasz Pawłowski, Jakub Kamieniarz, Jakub Buler, Adam Deter

## PCB visualisations

![Main PCB front visualisation](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/5.png?raw=true)
![Main PCB back visualisation](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/6.png?raw=true)
![Photoresistor PCB front visualisation](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/7.png?raw=true)
![Photoresistor PCB back visualisation](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/8.png?raw=true)

## Kicad Schemas

![Kicad screen 1](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/1.png?raw=true)
![Kicad screen 2](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/2.png?raw=true)
![Kicad Eeschema 1](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/3.svg?raw=true)
![Kicad eeschema 2](https://github.com/NiebieskiRekin/RobotASK/blob/main/zdj/4.svg?raw=true)

## Python script

Tile detection visualisation

![Tile detection visualisation](robotask-python-vis.png)

Calibration

![Calibration](robotask-python-calibration.png)

## Repository

<https://github.com/NiebieskiRekin/RobotASK>
