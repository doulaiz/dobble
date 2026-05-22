#!/bin/bash
set -e

VERSION=$(node -p "require('./package.json').version")

# Accept both "v1.2.3" and "1.2.3" tag formats, prefer the "v" prefix
EXPECTED_TAG="v$VERSION"
EXPECTED_TAG_NO_V="$VERSION"

COMMIT_TAGS=$(git tag --points-at HEAD)

if [ -z "$COMMIT_TAGS" ]; then
  echo "Error: the last commit has no git tag. Tag it first:"
  echo "  git tag $EXPECTED_TAG && git push origin $EXPECTED_TAG"
  exit 1
fi

MATCHED_TAG=""
for t in $COMMIT_TAGS; do
  if [ "$t" = "$EXPECTED_TAG" ] || [ "$t" = "$EXPECTED_TAG_NO_V" ]; then
    MATCHED_TAG="$t"
    break
  fi
done

if [ -z "$MATCHED_TAG" ]; then
  echo "Error: no tag on the last commit matches package.json version $VERSION."
  echo "  Tags found on last commit: $COMMIT_TAGS"
  echo "  Expected: $EXPECTED_TAG or $EXPECTED_TAG_NO_V"
  exit 1
fi

# Verify the tag exists on origin
REMOTE_TAG=$(git ls-remote --tags origin "refs/tags/$MATCHED_TAG")

if [ -z "$REMOTE_TAG" ]; then
  echo "Error: tag '$MATCHED_TAG' has not been pushed to origin. Run:"
  echo "  git push origin $MATCHED_TAG"
  exit 1
fi

echo "Pre-deploy checks passed: tag '$MATCHED_TAG' matches version $VERSION and is present on origin."
