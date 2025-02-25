+++
title = 'Piano Tiles Robot'
date = 2025-04-10
tags = ["Cpp", "Arduino", "KiCad"]
categories = ["Embedded", "Studia"]
+++

A Piano Tiles (mobile game) hardware autoclicker built on the ATmega328. All electrical sketches and the PCB were designed in [KiCad](https://www.kicad.org/). Code for the microprocessor was written in C++ using Arduino and Servo libraries as well as the [PlatformIO](https://platformio.org/install/ide?install=vscode) VSCode extension.

This project also has a live visualisation Python script that communicates with the main board over serial to display data captured by the photoresistor module. This script can also be used to quickly adjust some parameters at the start of runtime.

This repository was created for a university group project for [RoboDay 2024](https://www.facebook.com/events/1518830758974874) at Poznań University of Technology.
Made by: Tomasz Pawłowski, Jakub Kamieniarz, Jakub Buler, Adam Deter

![Main PCB front visualisation](zdj/5.png)
![Main PCB back visualisation](zdj/6.png)
![Photoresistor PCB front visualisation](zdj/7.png)
![Photoresistor PCB back visualisation](zdj/8.png)
![Kicad screen 1](zdj/1.png)
![Kicad screen 2](zdj/2.png)
![Kicad Eeschema 1](zdj/3.svg)
![Kicaad eeschema 2](zdj/4.svg)

## Repository

<https://github.com/NiebieskiRekin/RobotASK>
