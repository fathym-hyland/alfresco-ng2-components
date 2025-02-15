#!/usr/bin/env bash

# ===================================================================
# In this hook-file define only dynamic-ish environmental variables.
# Put the static environment variables into the env.yml file
# Command executions or any other installation logic
# is supposed to be in the "install.sh" hook script.
# ===================================================================
PARENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
ENV_FILE=${1:-"/tmp/github_vars.env"}

# Settings for protractor-smartrunner -------------------------------------------------
export GIT_HASH=$(git rev-parse HEAD)


# Settings for Nx ---------------------------------------------------------------------
export BASE_HASH="$(git merge-base origin/"$GITHUB_BASE_REF" HEAD)"
export HEAD_HASH="HEAD"
export HEAD_COMMIT_HASH=${GH_COMMIT}
export COMMIT_MESSAGE=$(git log --format=%B -n 1 "$HEAD_COMMIT_HASH")

#########################################################################################
# Settings based of Github event type
#########################################################################################
if [ "${GITHUB_EVENT_NAME}" == "push" ]; then
    # Settings for merges ---------------------------------------------------------------
    BRANCH=${GITHUB_REF##*/}
    if [[ "$BRANCH" =~ ^master(-patch.*)?$ ]]; then
        # into master(-patch*)
        export NX_CALCULATION_FLAGS="--all"
        export BUILD_OPTS="--configuration production"
    elif [[ "$BRANCH" =~ ^develop-patch.*$ ]]; then
        # into develop-patch*
        echo -e "\e[32mSetting up CI jobs for patch version creation.\e[0m"
        export NX_CALCULATION_FLAGS="--all"
        export BUILD_OPTS="--configuration production"
    else
        # into develop
        export NX_CALCULATION_FLAGS="--base=$(git describe --tags $(git rev-list --tags --max-count=1)) --head=$HEAD_HASH"
        export BUILD_OPTS="--configuration production"
    fi
elif [ "${GITHUB_EVENT_NAME}" == "pull_request" ]; then
    # Settings for PRs ------------------------------------------------------------------
    export NX_CALCULATION_FLAGS="--base=origin/$GITHUB_BASE_REF --head=$HEAD_HASH"
    export BUILD_OPTS="--configuration production"
elif [ "${GITHUB_EVENT_NAME}" == "schedule" ]; then
    # Settings for Cron -----------------------------------------------------------------
    export NX_CALCULATION_FLAGS="--all"
    export BUILD_OPTS="--configuration production"
else
    # Settings for API ------------------------------------------------------------------
    export NX_CALCULATION_FLAGS="--all"
    export BUILD_OPTS="--configuration production"
fi

# Settings for S3 caching -------------------------------------------------------------
pip install --user awscli

if [ "${GITHUB_EVENT_NAME}" == "push" ]; then
    echo "push"
elif [ "${GITHUB_EVENT_NAME}" == "pull_request" ]; then
    echo "pull_request"
    export BASE_HASH="origin/$GITHUB_BASE_REF"
    source "$PARENT_DIR/partials/_ci-flags-parser.sh"
elif [ "${GITHUB_EVENT_NAME}" == "schedule" ]; then
    echo "cron"
else
    echo "api"
fi

# Cache for protractor smart-runner
export S3_SMART_RUNNER_PATH="$S3_DBP_PATH/smart-runner/$BUILD_ID"

# Cache for node_modules
export NODE_VERSION=$(node -v)
export PACKAGE_LOCK_SHASUM=$(shasum ./package-lock.json | cut -f 1 -d " ")
# This can change regardless of package-lock.json, so we need to calculate with this one as well
export S3_NODE_MODULES_CACHE_ID=$(echo "$NODE_VERSION-$PACKAGE_LOCK_SHASUM" | shasum  | cut -f 1 -d " ")
export S3_NODE_MODULES_CACHE_PATH="$S3_DBP_PATH/cache/node_modules/$S3_NODE_MODULES_CACHE_ID.tar.bz2"

echo "========== Caching settings =========="
echo "S3_SMART_RUNNER_PATH=$S3_SMART_RUNNER_PATH" | tee -a $ENV_FILE
echo "PACKAGE_LOCK_SHASUM=$PACKAGE_LOCK_SHASUM" | tee -a $ENV_FILE
echo "NODE_VERSION=$NODE_VERSION" | tee -a $ENV_FILE
echo "S3_NODE_MODULES_CACHE_ID=$S3_NODE_MODULES_CACHE_ID" | tee -a $ENV_FILE
echo "S3_NODE_MODULES_CACHE_PATH=$S3_NODE_MODULES_CACHE_PATH" | tee -a $ENV_FILE
echo "========== Nx settings =========="
echo "GIT_HASH=$GIT_HASH" | tee -a $ENV_FILE
echo "BASE_HASH=$BASE_HASH" | tee -a $ENV_FILE
echo "HEAD_HASH=$HEAD_HASH" | tee -a $ENV_FILE


echo "========== Build vars=========="
echo "BUILD_OPTS=$BUILD_OPTS" | tee -a $ENV_FILE
echo "NX_CALCULATION_FLAGS=$NX_CALCULATION_FLAGS" | tee -a $ENV_FILE
echo "HEAD_COMMIT_HASH=$HEAD_COMMIT_HASH" | tee -a $ENV_FILE
COMMIT_MESSAGE=$(echo "COMMIT_MESSAGE='${COMMIT_MESSAGE}'" | tr '*' '-' | tr '\n' ' ')
echo $COMMIT_MESSAGE | tee -a $ENV_FILE
