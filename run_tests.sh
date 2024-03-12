#!/usr/bin/env bash
TOKEN="90c0bc88-2b95-441b-b440-63ccde273c5d"
IDFOLDER='65ee1fa5d398bc02d3184f1c'
IDFILE='65edcb5afc42123e20f40d2b'
# IDFILE='65ef5aff2b616b2fe4d02872'

# ======================================================================
# curl -XGET "0.0.0.0:5000/files/65ef5aff2b616b2fe4d02872/publish" -H "X-Token: 90c0bc88-2b95-441b-b440-63ccde273c5d" ; echo ""

# ======================================================================
# echo 'db.files.find()' | mongo files_manager

# ======================================================================
# Task 6
# echo "Test 1"
# curl -XGET '0.0.0.0:5000/files' -H "X-Token: $TOKEN" ; echo ""
# echo
# echo "Test 2"
# curl -XGET "0.0.0.0:5000/files?parentId=$IDFOLDER" -H "X-Token: $TOKEN" ; echo ""
# echo
# echo "Test 3"
# curl -XGET "0.0.0.0:5000/files/$IDFILE" -H "X-Token: $TOKEN" ; echo ""
# echo
# echo "Test 3 => not found"
# curl -XGET "0.0.0.0:5000/files/$IDFILE" -H "X-Token: $TOKEN" ; echo ""

# ======================================================================
# Task 7
# echo "Test 1"
# curl -XGET "0.0.0.0:5000/files/$IDFILE" -H "X-Token: $TOKEN" ; echo ""
# echo
# echo "Test 2"
# curl -XPUT "0.0.0.0:5000/files/$IDFILE/publish" -H "X-Token: $TOKEN" ; echo ""
# echo
# echo "Test 3"
# curl -XPUT "0.0.0.0:5000/files/$IDFILE/unpublish" -H "X-Token: $TOKEN" ; echo ""

# ======================================================================
# Task 8
echo "Test 1 => false"
curl -XPUT "0.0.0.0:5000/files/$IDFILE/unpublish" -H "X-Token: $TOKEN" ; echo ""
echo
echo "Test 2 => Hello Webstack!"
curl -XGET "0.0.0.0:5000/files/$IDFILE/data" -H "X-Token: $TOKEN" ; echo ""
echo
echo "Test 3 => {"error":"Not found"}"
curl -XGET "0.0.0.0:5000/files/$IDFILE/data" ; echo ""
echo
echo "Test 4 => true"
curl -XPUT "0.0.0.0:5000/files/$IDFILE/publish" -H "X-Token: $TOKEN" ; echo ""
echo
echo "Test 5 => Hello Webstack!"
curl -XGET "0.0.0.0:5000/files/$IDFILE/data" ; echo ""


# ======================================================================
#  | jq
#  | jq '.[] | select(.parentId == 0)'

# ======================================================================
# python3 '5-image_upload.py' image.png $TOKEN $IDFOLDER

# ======================================================================
# Connect
# curl '0.0.0.0:5000/connect' -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""

# ======================================================================
# Post File
# curl -XPOST '0.0.0.0:5000/files' -H "X-Token: f21fb953-16f9-46ed-8d9c-84c6450ec80f" -H "Content-Type: application/json" -d '{ "name": "myText.txt", "type": "file", "data": "SGVsbG8gV2Vic3RhY2shCg==" }' ; echo ""

# ======================================================================
# ls /tmp/files_manager/

# ======================================================================
# Post Folder
# curl -XPOST '0.0.0.0:5000/files' -H "X-Token: $TOKEN" -H "Content-Type: application/json" -d '{ "name": "images", "type": "folder" }' ; echo ""

# ======================================================================
# npx eslint --fix "${PATHS[@]}"


# ======================================================================
# {'id': '65ef5aff2b616b2fe4d02872',
# 'userId': '65eba8c3e276d51494151715',
# 'name': 'image.png',
# 'type': 'image',
# 'isPublic': True,
# 'parentId': '65ee1fa5d398bc02d3184f1c'}