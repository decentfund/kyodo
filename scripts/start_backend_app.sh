#!/bin/bash
# Launch a sleeping child process that will be "waited" next
sleep infinity & PID=$!

# Trap "graceful" kills and use them to kill the sleeping child
trap "kill $PID" TERM

# Launch a subprocess not attached to this script that will trigger
# commands after its end
( sh -c "
    # Watch main script PID. Sleep duration can be ajusted 
    # depending on reaction speed you want
    while [ -e /proc/$$ ]; do sleep 0; done

    # Kill the infinite sleep if it's still running
    [ -e /proc/$PID ] && kill $PID

    # Commands to launch after any stop
    sed -i '/REACT_APP_BACKEND_URI/d' .env
    echo "Terminating and cleaning env variables"
" & )    

# export env var
export REACT_APP_BACKEND_URI="http://localhost:3666"
echo "REACT_APP_BACKEND_URI=\"$REACT_APP_BACKEND_URI\"" > .env

# Move to kyodo-app directory
cd packages/kyodo-backend

# Start Backend App
yarn start

# Waiting for infinite sleep to end...
wait

# Commands to launch after graceful stop
echo "Graceful ending"
