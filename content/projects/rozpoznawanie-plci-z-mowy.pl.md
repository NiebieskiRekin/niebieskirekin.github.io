+++
title = 'Rozpoznawanie płci z mowy'
date = 2024-12-04
tags = ["Python", "Matplotlib"]
categories = ["Visualisations", "Studia"]
+++

Projekt na przedmiot `Komunikacja Człowiek-Komputer`. Algorytm rozpoznaje płeć na podstawie mowy poprzez analizę tonu krtaniowego z wykorzystaniem Harmonic Product Spectrum.

Algorytm nie jest deterministyczny ze względu na wybór losowy w przypadku braku dokładnego
dopasowania. Tym niemniej zachowuje wysoką dokładność >90% dla udostępnionych danych
wejściowych.

![parametry algorytmu](kck-sprawozdanie.png)

![Opis algorytmu](opis-algorytmu-kck.png)

## Przykładowy wykres diagnostyczny

![wykres dla przykładowej próbki głosu](rozpoznawanie-mowy-wykres.png)

## Kod

```python
#!/usr/bin/env python

import numpy as np
import math
import os
import sys
import scipy.io
import warnings
import matplotlib.pyplot as plt
import random

DEBUG = False


def make_prediction_for_file(file: str, hps_iter: int, params, debug=False):
    sampling_rate, signal = read_signal_from_file(file)
    frequencies, spectrum = spectrum_func(signal, sampling_rate)
    harmonic_product_spectrum, harmonic_components = harmonic_product_spectrum_func(
        spectrum, hps_iter
    )

    results, dominant_frequency = make_prediction(
        frequencies, harmonic_product_spectrum, params
    )

    if debug:
        if "".join(results) != get_label(file):
            print("".join(results), file, dominant_frequency)
        fig = plot_harmonic_product_spectrum(
            frequencies, spectrum, harmonic_product_spectrum, harmonic_components
        )
        fig.suptitle(file)
        res_dir = "graphs"
        try:
            os.mkdir(res_dir)
        except FileExistsError:
            pass
        fig.savefig(
            os.path.join(
                res_dir,
                os.path.basename(file) + ".png",
            )
        )
        plt.close()

    if not results:
        results = random.choice(list(params.keys()))
    results = random.choice(results)
    if not debug:
        print(results)

    return {
        "file": file,
        "prediction": results,
        "dominant_frequency": dominant_frequency,
    }


def make_prediction_for_path(path, hps_iter, params, debug=False):
    if os.path.isfile(path):
        return [make_prediction_for_file(path, hps_iter, params, debug)]
    elif os.path.isdir(path):
        result = []
        for file in os.listdir(path):
            file = os.path.join(path, file)
            if os.path.isfile(file):
                result.append(make_prediction_for_file(file, hps_iter, params, debug))
        return result
    else:
        raise FileNotFoundError


def read_signal_from_file(path):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        sampling_rate, signal = scipy.io.wavfile.read(path)
    if len(signal.shape) > 1:
        signal = signal.mean(axis=1)
    return sampling_rate, signal


def window(n):
    return np.sqrt(-((np.linspace(-1, 1, n)) ** 2) + 1)


def spectrum_func(signal, sampling_rate, window_func=window):
    _input = signal * window_func(signal.size)
    n = len(signal)
    half_n = int(math.floor(n / 2))
    spectrum = abs(np.fft.fft(_input))[1:half_n]
    freqs = np.fft.fftfreq(len(_input), d=1 / sampling_rate)[1:half_n]
    return freqs, spectrum


def harmonic_product_spectrum_func(spectrum, hps_iter):
    harmonic_components = []
    hps = spectrum.copy()
    for i in range(hps_iter):
        harmonic_component = spectrum[:: i + 1]
        harmonic_components.append(harmonic_component)
        hps[: len(harmonic_component)] *= harmonic_component
    return hps, harmonic_components


def plot_harmonic_component(axis, x_frequencies, harmonic_component, i):
    axis.plot(
        x_frequencies,
        np.pad(
            harmonic_component,
            (0, len(x_frequencies) - len(harmonic_component)),
            mode="constant",
            constant_values=0,
        ),
    )
    axis.set_title(f"Hps stage #{i}")
    axis.set_xlim([30, 500])
    axis.grid()


def plot_harmonic_product_spectrum(
    frequencies,
    spectrum,
    harmonic_product_spectrum,
    harmonic_components,
):
    fig, (spectrum_ax, fundamental_ax, *component_axs) = plt.subplots(
        len(harmonic_components) + 2, 1, figsize=(10, 20)
    )
    fig.tight_layout()
    spectrum_ax.plot(
        frequencies,
        spectrum,
    )
    spectrum_ax.set_title("Spectrum")
    spectrum_ax.set_xlim([0, 5000])
    spectrum_ax.grid()

    fundamental_ax.plot(
        frequencies,
        harmonic_product_spectrum,
    )
    fundamental_ax.set_title("Fundamental Frequency")
    fundamental_ax.set_xlim([30, 500])
    fundamental_ax.grid()

    for i, (ax, hc) in enumerate(zip(component_axs, harmonic_components)):
        plot_harmonic_component(ax, frequencies, hc, i + 1)
    return fig


def make_prediction(frequencies, harmonic_product_spectrum, prediction_params):
    assert len(frequencies) == len(harmonic_product_spectrum)

    lb, ub = 20_000, 20
    for lower, upper in prediction_params.values():
        lb = min(lower, lb)
        ub = max(upper, ub)

    lbi = 0
    while lbi < len(frequencies) and frequencies[lbi] < lb:
        lbi += 1

    ubi = len(frequencies) - 1
    while 0 <= ubi and ub < frequencies[ubi]:
        ubi -= 1

    max_hps_val = 0
    max_hps_idx = lbi
    for i in range(lbi, ubi + 1):
        if harmonic_product_spectrum[i] > max_hps_val:
            max_hps_val = harmonic_product_spectrum[i]
            max_hps_idx = i

    dominant_frequency = frequencies[max_hps_idx]
    return [
        key
        for (key, (lower_bound, upper_bound)) in prediction_params.items()
        if lower_bound <= dominant_frequency and dominant_frequency < upper_bound
    ], dominant_frequency


def check_result(predicted, expected):
    return ("T" if (predicted == expected) else "F") + predicted


def get_label(path):
    assert os.path.isfile(path)
    return os.path.splitext(os.path.basename(path))[0][-1]


def main():
    hps_iter = 6
    params = {"M": [70, 175], "K": [170, 270]}

    error_matrix: dict[str, int] = {"TM": 0, "FM": 0, "TK": 0, "FK": 0}
    dominant_frequencies = {"TM": [], "FM": [], "TK": [], "FK": []}

    if len(sys.argv) > 1 and len(sys.argv[1]) > 0:
        for path in sys.argv[1:]:
            res = make_prediction_for_path(path, hps_iter, params, debug=DEBUG)
            if DEBUG:
                predicted = res[0].get("prediction")
                expected = get_label(res[0].get("file"))
                err_matrix_result = check_result(predicted, expected)
                error_matrix[err_matrix_result] += 1
                dominant_frequency = res[0].get("dominant_frequency")
                dominant_frequencies[err_matrix_result].append(dominant_frequency)

    else:
        results = make_prediction_for_path("./train/", hps_iter, params, debug=DEBUG)
        if DEBUG:
            for res in results:
                predicted = res.get("prediction")
                expected = get_label(res.get("file"))
                err_matrix_result = check_result(predicted, expected)
                error_matrix[err_matrix_result] += 1
                dominant_frequency = res.get("dominant_frequency")
                dominant_frequencies[err_matrix_result].append(dominant_frequency)

    if DEBUG:
        print("Error matrix: ", error_matrix)
        print(
            "Result: ",
            (error_matrix.get("TM", 0) + error_matrix.get("TK", 0))
            / sum(error_matrix.values()),
        )
        for key, value in dominant_frequencies.copy().items():
            dominant_frequencies[key] = sorted(value)
            print(key, dominant_frequencies[key][0], dominant_frequencies[key][-1])


if __name__ == "__main__":
    main()
```
