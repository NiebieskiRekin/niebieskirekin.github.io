+++
title = 'Smart Chessboard'
date = 2024-12-04
tags = ["Python", "Raspberry Pi", "KiCad"]
categories = ["Embedded", "Linux", "Studia"]
+++

Inteligentna szachownica na Raspberry Pi 5 z wykorzystaniem kontaktronów oraz magnesów przymocowanych do bierek, za pomocą których, wykrywane jest położenie figur na planszy. Program następnie analizuje dostępne warianty możliwych do wykonania ruchów oraz pokazuje zalecany ruch w danym momencie na wyświetlaczu LCD oraz na lichess.org. Projekt zaliczeniowy na Systemy Wbudowane.

Celem projektu było stworzenie inteligentnej szachownicy, która jest w stanie, analizować obecną pozycję figur na planszy. Szachownica wspiera gracza przy wyborze optymalnych ruchów i wyborze odpowiedniej strategii w celu pokonania drugiego gracza. Dodatkowym atutem jest możliwość podłączenia urządzenia do monitora i wyświetlenia aktualnego stanu szachownicy za pomocą internetowej platformy lichess.org. Wykrywanie pozycji bierek jest możliwe dzięki wykorzystaniu 64 kontaktronów, które znajdują się pod każdym polem na planszy. Do każdej figury przymocowany jest magnes neodymowy, dzięki czemu po zbliżeniu go na odpowiednią odległość, możemy wykryć, że dane pole jest okupowane przez daną bierkę. Kontaktrony zostały połączone w macierz za pomocą pięciu multiplekserów wejścia, które są podłączone do multipleksera I2C. Komponent ten łączy odbiera sygnał ze wszystkich pól szachownicy, a następnie przekazuje je do Raspberry Pi 5, która z wykorzystaniem języka python analizuje otrzymane dane. Wykorzystane biblioteki: board, adafruit_tca9548a, time, busio, digitalio, adafruit_mcp230xx, socket, adafruit_ssd1306, PIL, chess, selenium, stockfish. Program podzielony jest na dwie części. Pierwsza, przetwarza obecną sytuację na planszy, iterując po wszystkich polach na planszy i wysyła wykryte zmiany za pomocą protokołu TCP do drugiego procesu, który z wykorzystaniem darmowego silnika szachowego Stockfish analizuje dostępne warianty możliwych do wykonania ruchów i zwraca zalecany ruch w danym momencie. Informacja ta wysyłana jest ponownie (z wykorzystaniem TCP) do pierwszego procesu, który otrzymane dane pokazuje na wyświetlaczu lcd, który również połączony jest do multipleksera I2C. Całość została zamknięta w wykonanej z drewna skrzyni, z której wychodzą 4 przewody: SCK, SDA oraz wspólna masa, które następnie można podłączyć do Raspberry Pi 5 oraz przewód zasilający USB.

Wykonany projekt spełnia wszystkie główne założenia projektowe. Stworzona szachownica pozwala na wykrycie stanu bierek na planszy i pomaga w wyborze optymalnego ruchu w danym momencie. Dzięki wykorzystaniu multipleksera I2C udało się wzbogacić projekt o dodatkowy wyświetlacz, dzięki czemu obu graczy ma możliwość w prosty sposób sprawdzić podpowiedzi ze strony Stockfisha. Różnicą względem pierwotnych założeń jest wykorzystanie pięciu (zamiast początkowych czterech) multiplekserów wejścia, co było spowodowane otrzymaniem uszkodzonych komponentów.

# Zdjęcia

![Z zewnątrz](chessboard-outside.png)
![W środku](chessboard-inside.png)
![Wyświetlacze](chessboard-display.png)

## Schemat ideowy

![schemat ideowy](szachownica_schemat_pogladowy.png)

## Schemat połączeniowy

![schemat połączeniowy](szachownica_schemat_polaczeniowy.png)

## Kod

<https://github.com/KamieniarzJakub/Smart-Chessboard>

Kod, który został uruchomiony na Raspberry Pi został napisany przez moich kolegów. Istotne pliki to `szachy.py` oraz `chessboard.py` na branchu `rpi1`.

### Część 1 - odczyt oraz wyświetlanie informacji o zalecanym ruchu

```python
import board
import adafruit_tca9548a
import time
import board
import busio
from digitalio import Direction, Pull
from adafruit_mcp230xx.mcp23017 import MCP23017
import socket

from board import SCL, SDA, MISO, MOSI
import busio
import adafruit_ssd1306
from PIL import Image, ImageDraw, ImageFont

# Załadowanie czcionki
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)

display_pins = [4, 5]  # Definicja pinów dla wyświetlaczy LED

# Słownik przechowujący konfigurację kanałów i odpowiadających im pinów
pola = {
  0: {
        # Wykluczone: 0, 4, 11, 13, 15
        1: ["C6"],
        2: ["C7"],
        3: ["C8"],
        5: ["D6"],
        6: ["D7"],
        7: ["D8"],
        8: ["B8"],
        9: ["B7"],
        10: ["B6"],
        12: ["A8"],
        14: ["A6"]
        },
    1: {
        # Wykluczone: 2, 8
        0: ["G5"],
        1: ["G6"],
        3: ["G8"],
        4: ["H5"],
        5: ["H6"],
        6: ["H7"],
        7: ["H8"],
        9: ["F7"],
        10: ["F6"],
        11: ["F5"],
        12: ["E8"],
        13: ["E7"],
        14: ["E6"],
        15: ["E5"]
    },
    2: {
        # Wszystkie piny
        0: ["G4"],
        1: ["G3"],
        2: ["G2"],
        3: ["G1"],
        4: ["H4"],
        5: ["H3"],
        6: ["H2"],
        7: ["H1"],
        8: ["F1"],
        9: ["F2"],
        10: ["F3"],
        11: ["F4"],
        12: ["E1"],
        13: ["E2"],
        14: ["E3"],
        15: ["E4"]
    },
    6: {
        # Wykluczone: 3, 4
        0: ["C4"],
        1: ["C3"],
        2: ["C2"],
        5: ["D3"],
        6: ["D2"],
        7: ["D1"],
        8: ["B1"],
        9: ["B2"],
        10: ["B3"],
        11: ["B4"],
        12: ["A4"],
        13: ["A3"],
        14: ["A2"],
        15: ["A1"]
        },
    7: {
        # Wykluczone: 1 oraz 6-11
        0: ["G7"],
        2: ["B5"],
        3: ["A5"],
        4: ["A7"],
        5: ["D5"],
        12: ["C5"],
        13: ["F8"],
        14: ["C1"],
        15: ["D4"]
        }
}

# Funkcja inicjalizująca układ MCP23017 dla danego kanału
def setup_mcp(channel):
    # Inicjalizacja magistrali I2C
    i2c = busio.I2C(board.SCL, board.SDA)
    # Inicjalizacja układu MCP23017
    mcp = MCP23017(i2c)

    # Konfiguracja pinów jako wejścia z podciągnięciem do VCC
    for pin in pola[channel].keys():
        pola[channel][pin].append(mcp.get_pin(pin))
        pola[channel][pin][-1].direction = Direction.INPUT
        pola[channel][pin][-1].pull = Pull.UP

# Funkcja konfigurująca wyświetlacz OLED
def setup_led():
    i2c = busio.I2C(board.SCL, board.SDA)
    display = adafruit_ssd1306.SSD1306_I2C(128, 32, i2c)
    return display

# Funkcja do wyświetlania tekstu na wyświetlaczu OLED
def display_text(display, msg):
    image = Image.new("1", (128, 32))  # Utworzenie czarno-białego obrazu
    draw = ImageDraw.Draw(image)
    draw.text((0, 0), msg, font=font, fill=255)  # Rysowanie tekstu
    display.fill(0)  # Czyszczenie wyświetlacza
    display.image(image)  # Przesłanie obrazu na wyświetlacz
    display.show()

# Tablica przechowująca wyświetlacze LED
led_displays = [None, None]

# Funkcja odczytująca stany przycisków dla danego kanału
def read_mcp(channel):
    fields = []
    for pin in pola[channel].keys():
        field, button = pola[channel][pin]
        if button.value:  # Sprawdzenie, czy przycisk jest wciśnięty
            fields.append(field)
    return fields

# Konfiguracja serwera sieciowego
host = "127.0.0.1"
port = 8080

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind((host, port))
server.listen(1)

clientSocket, clientAddress = server.accept()  # Oczekiwanie na połączenie klienta

i2c = board.I2C()  # Inicjalizacja magistrali I2C
tca = adafruit_tca9548a.TCA9548A(i2c)  # Multiplexer TCA9548A

# Inicjalizacja kanałów MCP23017
for channel in pola.keys():
    if tca[channel].try_lock():
        for address in tca[channel].scan():
            if address != 0x70:
                setup_mcp(channel)
        tca[channel].unlock()

# Inicjalizacja wyświetlaczy LED
for i in display_pins:
    while not tca[i].try_lock():
        pass
    for address in tca[i].scan():
        if address != 0x70:
            led_displays[i % 2] = setup_led()
            display_text(led_displays[i % 2], "Loading...")
    tca[i].unlock()

# Wstępna ustalenie wartości początkowych
_output = "111" 
count = 0
start = time.time()

while True:
    output = []
    for channel in pola.keys():
        if tca[channel].try_lock():
            for address in tca[channel].scan():
                if address != 0x70:  # Filtracja adresów
                    for x in read_mcp(channel):
                        output.append(x)
            tca[channel].unlock()
    if len(output) > 0:
        print(sorted(output), time.time())
    output = ",".join(output)

    if output != _output:
        if count == 1:
            clientSocket.sendall((output).encode("utf-8"))  # Wysyłanie danych do klienta
            count = 0
            _output = output
        else:
            count += 1
    else:
        count = 0

    clientSocket.settimeout(0.1)  # Ustawienie timeoutu dla socketu
    try:
        data = clientSocket.recv(1024).decode("utf-8")
        print(data)
        for i in display_pins:
            if tca[i].try_lock():
                for address in tca[i].scan():
                    if address != 0x70:
                        display_text(led_displays[i % 2], data)  # Wyświetlanie danych
                tca[i].unlock()
    except socket.timeout:
        pass

    time.sleep(0.1)
```

### Część 2 - analiza szachownicy oraz wyświetlenie obecnego stanu na Lichess.org

```python
import chess
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from stockfish import Stockfish
import time

# Inicjalizacja Selenium i przeglądarki
service = Service("/usr/bin/chromedriver")  # Ścieżka do chromedriver.exe
driver = webdriver.Chrome(service=service)
driver.get("https://lichess.org/editor/")

# Inicjalizacja szachownicy i Stockfisha
board = chess.Board()
stockfish = Stockfish("/usr/games/stockfish")
stockfish.set_depth(10)
stockfish.set_skill_level(20)

# Zmienne globalne do obsługi roszady
global roszadaWhite, roszadaBlack
roszadaWhite = True
roszadaBlack = True

# Funkcja do aktualizacji szachownicy na Lichess
def update_board_in_browser(board):
    fen = board.fen().replace(" ", "_")
    fen_url = f"https://lichess.org/editor/{fen}"
    driver.get(fen_url)


# Funkcja obliczająca ruch użytkownika na podstawie zmiany pozycji
def calculateMove(previousPosition):
    global roszadaWhite, roszadaBlack
    actualPosition = previousPosition

    # Oczekiwanie na zmianę pozycji szachownicy
    while(previousPosition == actualPosition):
        message = clientSocket.recv(1024).decode("utf-8")
        actualPosition = message.strip().split(',')

        for element in previousPosition:
            if element not in actualPosition:
                difference = element

        time.sleep(0.1)
            
    pionekRuszajacy = difference
    print(pionekRuszajacy)

    previousPosition = actualPosition
    lenPrevious = len(previousPosition)
    bicie = False
    
    # Sprawdzanie, czy nastąpiło zbicie
    while(previousPosition == actualPosition):
        message = clientSocket.recv(1024).decode("utf-8")
        actualPosition = message.strip().split(',')

        if lenPrevious - len(actualPosition) == 1:    # Jeśli zmniejszyła się liczba pionków
            bicie = True
            for element in previousPosition:
                if element not in actualPosition:
                    difference = element                        
            break
        elif lenPrevious - len(actualPosition) == -1:    # Jeśli zwiększyła się liczba pionków
            for element in actualPosition:
                if element not in previousPosition:
                    difference = element
            break
        else:
            time.sleep(0.1)

    previousPosition = actualPosition

    # Obsługa ruchów związanych ze zbiciem
    if bicie == True:
        pionekZbity = difference
        
        while(previousPosition == actualPosition):
            message = clientSocket.recv(1024).decode("utf-8")
            actualPosition = message.strip().split(',')

            for element in actualPosition:
                if element not in previousPosition:
                    difference = element
            time.sleep(0.1)

        string = pionekRuszajacy + pionekZbity
        return string.lower(), actualPosition
    
    previousPosition = actualPosition

    # Obsługa specjalnych przypadków, takich jak roszady
    if roszadaWhite == True:
        if pionekRuszajacy == 'E1':
            if difference == 'G1':
                _ruch = difference
                # Roszada krótka biała
                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')

                    for element in previousPosition:
                        if element not in actualPosition:
                            print(f"coś tam{element}")
                            _difference = element         
                    time.sleep(0.1)               

                previousPosition = actualPosition

                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')

                    for element in actualPosition:
                        if element not in previousPosition:
                            print(f"coś tam2{element}")
                            __difference = element
                    time.sleep(0.1)               

                string = pionekRuszajacy + _ruch
                print(string.lower())

                return string.lower(), actualPosition
                
            elif difference == 'C1':
                _ruch = difference
                # Roszada długa biała
                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')

                    for element in previousPosition:
                        if element not in actualPosition:
                            _difference = element
                    time.sleep(0.1)

                previousPosition = actualPosition

                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')
                        
                    for element in actualPosition:
                        if element not in previousPosition:
                            _difference = element

                string = pionekRuszajacy + _ruch
                print(string.lower())

                return string.lower(), actualPosition
            else:
                roszadaWhite = False # Wyłączenie możliwości roszady białych
    
    if roszadaBlack == True:
        if pionekRuszajacy == 'E8':
            if difference == 'G8':
                # Roszada krótka czarna
                _ruch = difference
                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')

                    for element in previousPosition:
                        if element not in actualPosition:
                            difference = element
                    time.sleep(0.1)               

                previousPosition = actualPosition

                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')

                    for element in actualPosition:
                        if element not in previousPosition:
                            difference = element
                
                string = pionekRuszajacy + _ruch
                print(string.lower())

                return string.lower(), actualPosition
                
            elif difference == 'C8':
                _ruch = difference
                # Roszada długa biaczarnała
                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')

                    for element in previousPosition:
                        if element not in actualPosition:
                            difference = element
                    time.sleep(0.1)              

                previousPosition = actualPosition

                while(previousPosition == actualPosition):
                    message = clientSocket.recv(1024).decode("utf-8")
                    actualPosition = message.strip().split(',')

                    for element in actualPosition:
                        if element not in previousPosition:
                            difference = element
                
                string = pionekRuszajacy + _ruch
                print(string.lower())

                return string.lower(), actualPosition
            else:
                roszadaBlack = False    # Wyłączenie możliwości roszady czarnych

    # Obsługa promocji danego pionka -> dama
    if difference in ('A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'):
        if stockfish.get_what_is_on_square(pionekRuszajacy.lower()) == 'Piece.WHITE_PAWN':
            string = pionekRuszajacy + difference + 'q'
            return string.lower, actualPosition
    elif difference in ('A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'):
        if stockfish.get_what_is_on_square(pionekRuszajacy.lower()) == 'Piece.BLACK_PAWN':
            string = pionekRuszajacy + difference + 'q'
            return string.lower, actualPosition

     # Rekurencja w przypadku błędnych ruchów (np. powtarzających się pozycji)
    if string[:2] == string[2:]:
        return calculateMove(actualPosition)
    
    string = pionekRuszajacy + difference

    return string.lower(), actualPosition
            

# Konfiguracja połączenia sieciowego
import socket
host = "127.0.0.1"
port = 8080
clientSocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
clientSocket.connect((host, port))


# Aktualizujemy szachownicę przed rozpoczęciem gry
update_board_in_browser(board)
print(board)
print("--------------------")

# Pozycje początkowe figur
basicPosition = [
    "A1", "B1", "C1", "D1", "E1", "F1", "G1", "H1",  # Białe figury
    "A2", "B2", "C2", "D2", "E2", "F2", "G2", "H2",  # Białe pionki
    "A7", "B7", "C7", "D7", "E7", "F7", "G7", "H7",  # Czarne pionki
    "A8", "B8", "C8", "D8", "E8", "F8", "G8", "H8"   # Czarne figury
]

message = clientSocket.recv(1024).decode("utf-8")
message = message.strip().split(',')
previousPosition = message

newPosition = message
print(previousPosition)

# Usuwanie brakujących figur
brakujace = set(basicPosition) - set(newPosition)
print(list(brakujace))
brakujace = list(brakujace)

for brak in brakujace:
    square = chess.parse_square(brak.lower())  
    board.remove_piece_at(square)


# Główna pętla gry
while not board.is_game_over():
    try:
        # Ustawienie pozycji Stockfisha
        stockfish.set_fen_position(board.fen())
        update_board_in_browser(board)

        # Ocena pozycji i propozycja ruchu Stockfisha
        stockfish_move = stockfish.get_top_moves(1)
        if not stockfish_move:
            print("Stockfish nie zwrócił żadnego ruchu. Gra zakończona.")
            break

        best_move = stockfish_move[0]["Move"]
        print(f"Ruch Stockfisha: {best_move}")

        # Wysyłanie najlepszego ruchu do wyświetlenia go na wyświetlaczu
        clientSocket.sendall(best_move.encode("utf-8"))


        # Wprowadzenie ruchu użytkownika
        move, newPosition = calculateMove(previousPosition)
        print(move)
        print(newPosition)
        previousPosition = newPosition

        # time.sleep(5)
        print(board.legal_moves)
        if chess.Move.from_uci(move) in board.legal_moves:
            board.push(chess.Move.from_uci(move))
            # Aktualizacja szachownicy w przeglądarce po ruchu gracza
            update_board_in_browser(board)
        else:
            # print("Nielegalny ruch. Spróbuj ponownie.")
            continue

        # Wykonanie ruchu przez Stockfisha
        if not board.is_game_over() and best_move in [m.uci() for m in board.legal_moves]:
            board.push(chess.Move.from_uci(best_move))
            print(f"Stockfish wykonuje ruch: {best_move}")
            # Aktualizacja szachownicy w przeglądarce po ruchu Stockfisha
            update_board_in_browser(board)
        else:
            print("Stockfish nie może wykonać ruchu.")

        print(board)
        print("--------------------")
    except Exception as e:
        print(f"Błąd: {e}")
        break

# Koniec gry
print("Koniec gry.")
print("Wynik:", board.result())

# Zamknięcie przeglądarki
driver.quit()
```
