#!/bin/bash
# Start Backend App
cd packages/kyodo-backend && yarn start &
PID=$!

# Trap "graceful" kills and use them to kill the sleeping child
trap "kill $PID 2> /dev/null" EXIT

# export env var
export REACT_APP_BACKEND_URI="http://localhost:3666"
echo "REACT_APP_BACKEND_URI=\"$REACT_APP_BACKEND_URI\"" > .env

# Launch a subprocess not attached to this script that will trigger
# commands after its end
( sh -c "
    # Watch main script PID. Sleep duration can be ajusted 
    # depending on reaction speed you want
    while kill -0 $PID 2> /dev/null; do sleep 0; done

    # Commands to launch after any stop
    sed -i -e '/REACT_APP_BACKEND_URI/d' .env
    echo \"Terminating and cleaning env variables\"
" & )    

wait

# Commands to launch after graceful stop
echo "Graceful ending"
