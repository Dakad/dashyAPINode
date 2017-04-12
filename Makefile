#!/bin/bash

DIR_BIN		= ./node_modules/.bin

DIR_SRC		= ./src
DIR_TEST 	= ./test
DIR_DOCS	= ./docs
DIR_LOGS	= ./logs
DIR_GIT		= ./.git
DIR_RELEASE = ./releases

ALL_TESTS 	= $(shell find $(DIR_TEST) $(DIR_SRC)  -type f -name "*.spec.js"  -not -path "*/node_modules*")

DOC_TEMPL 	= ./node_modules/ink-docstrap/template
REPORTER	= spec
TIMEOUT		= 10000
REDIS_PWD	= pwd
REDIS_DB_TEST = 7
REDIS_DB_PROD = 5

GIT_LAST_VERS = $(shell git describe --tags --abbrev=0)

APIDOC		= $(DIR_BIN)/apidoc -f ".+route.*\\.js$""  -i $(DIR_SRC) -o $(DIR_DOCS)/api/;
ESLINT		= $(DIR_BIN)/eslint --cache
JSDOC		= $(DIR_BIN)/jsdoc
MOCHA		= $(DIR_BIN)/mocha --bail --colors --timeout $(TIMEOUT) -R $(REPORTER) 
_MOCHA		= $(DIR_BIN)/_mocha 
NODEMON		= $(DIR_BIN)/nodemon
NYC			= $(DIR_BIN)/nyc --cache
REDIS_DB	= $(REDIS_DB_TEST)
REDIS_CLI	= redis-cli -a $(REDIS_PWD) -n $(REDIS_DB)
ISTANBUL	= $(DIR_BIN)/istanbul


dev:

	@echo "#####  Launch in PROD ENV";
	@echo "###  Resetting Redis cache ..." ;
	$(REDIS_CLI) FLUSHALL;
	@DEBUG=* \
	NODE_ENV=production \
	$(NODEMON) $(DIR_SRC)/app.js;
	@echo "##### Launch over" ;


lint:

	@echo "#####  ESLint-ing $(DIR_SRC)" ;
	@$(ESLINT) --color --fix $(DIR_SRC); 
	@echo "#####  ESLint : DONE";


test: lint

	$(eval REDIS_DB = $(REDIS_DB_TEST))
	@echo "#####  Mocha Testing : $(DIR_SRC) $(DIR_TEST)";
	@echo "###  Resetting Redis cache ..." ;
	$(eval REDIS_DB = $(REDIS_DB_TEST))
	$(REDIS_CLI) FLUSHALL;

	@NODE_ENV=test $(MOCHA) $(ALL_TESTS);
	@echo "#####  Mocha Testing : DONE";

test-watch:

	@NODE_ENV=test $(MOCHA) --watch $(ALL_TESTS);


test-cover: lint

	$(eval REDIS_DB = $(REDIS_DB_TEST))
	@echo "#####  NYC Test Covering : $(DIR_SRC) $(DIR_TEST)";
	@echo "###  Resetting Redis cache ..." ;
	@$(REDIS_CLI) FLUSHALL > /dev/null;

	@NODE_ENV=test $(NYC) \
		--reporter=lcov \
		--reporter-dir=$(DIR_DOCS)/coverage \
		$(_MOCHA) $(ALL_TESTS);

	@open ./docs/coverage/lcov-report/*.html
	@echo "#####  NYC Test Covering ... : DONE" ;


test-doc:

	@echo "#### Generating test reports ... ";
	#@test -d $(DIR_DOCS) || mkdir $(DIR_DOCS);
	#@test -d $(DIR_DOCS)/test || mkdir $(DIR_DOCS)/test;
	@NODE_ENV=test $(_MOCHA) $(ALL_TESTS)\
			--reporter mochawesome \
			--reporter-options 	\
				reportDir=$(DIR_DOCS)/test,reportFilename=reports,autoOpen=true;
	@NODE_ENV=test $(MOCHA) --reporter markdown  $(ALL_TESTS)  \
			> $(DIR_DOCS)/test/reports.md

	@echo "#### Generating test reports ... : DONE";

api-doc:

	@echo "#### ApiDoc-ing folder: $(DIR_SRC)";
	@$(APIDOC)
	@open $(DIR_DOCS)/api/index.html
	@echo "#### ApiDoc-ing ... : DONE";


docs: clean test-cover test-doc api-doc

	@echo "#### JsDoc-ing folder: $(DIR_SRC)";
	@$(JSDOC) \
		-c .jsdocrc.json \
		-d $(DIR_DOCS)/doc \
		-r \
		-R README.md \
		-t $(DOC_TEMPL) \
		--verbose \
		$(DIR_SRC) ;

	@open $(DIR_DOCS)/doc/index.html
	

	@echo "#####  Generating docs ... : DONE" ;


setup:

	@$(find ./logs -name "*.log")
	@node --harmony setup.js

archive : docs
	@echo "Archive Release ..."
	@echo "Create the release directory ..."
	@test -d $(DIR_RELEASE) || mkdir -pv $(DIR_RELEASE);

	@echo "Create a zip file out of the latest tag release ..."
	@git archive $(GIT_LAST_VERS) \
		--prefix="dashyAPI-$(GIT_LAST_VERS)/" \
		--format=zip \
		--output="$(DIR_RELEASE)/dashyAPI-$(GIT_LAST_VERS).zip";

	@echo "Created $(DIR_RELEASE)/dashyAPI-$(GIT_LAST_VERS)/.zip";

	@echo "Archive Release ... : DONE"

build: test docs

	@echo "##### Clear the logs folder .... ";
	@rm -rf $(DIR_LOGS)/*;
	@NODE_ENV=production node --harmony $(DIR_SRC)/app.js;

clean:

	@echo "##### Clear NYC folder";
	@rm -rf .nyc_output/*;
	@echo "##### Clear logs folder";
	@rm -rf $(DIR_LOGS)/*;
	@echo "##### Clear doc folder";
	@rm -rf $(DIR_DOCS)/*;
	@echo "#####  Resetting Redis PROD cache ..." ;
	@$(REDIS_CLI) FLUSHALL;
	@echo "#####  Resetting Redis TEST cache ..." ;
	@$(eval REDIS_DB = $(REDIS_DB_TEST))
	@$(REDIS_CLI) FLUSHALL;

	@echo "##### Cleanig DONE";



all: test 

.PHONY: docs setup test build dev archive
