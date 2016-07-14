#!/bin/bash

auto-multiple-choice prepare --mode s --prefix ./Projects/$1 --n-copies $2 ./Projects/$1/$3
auto-multiple-choice prepare --mode b --prefix ./Projects/$1 ./Projects/$1/$3 --data ./Projects/$1/data
auto-multiple-choice meptex --src ./Projects/$1/calage.xy --data ./Projects/$1/data
 