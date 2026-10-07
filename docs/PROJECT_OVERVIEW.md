# Project Overview

## Identity/authentication component

The entry flow uses constituency selection, election selection, voter ID lookup, registered-email OTP verification, and device/biometric verification.

## Anonymous voting component

After verification, the voting workflow proceeds through time-slot selection, candidate selection, credential-token use, encrypted ballot storage, and audit logging.

The workflow keeps voter verification separate from the anonymous ballot choice.

## Camera

The Expo application provides a front-facing live camera preview on the candidate and voting screens. The supplied implementation does not record or upload video.
