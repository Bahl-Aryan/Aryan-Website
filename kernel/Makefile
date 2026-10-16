# aryanOS kernel: the shell binary and its GoogleTest suite.
# AI Generated
#
#   make        build build/kernel
#   make run    build and start the shell
#   make test   build and run the tests
#   make clean  delete build/
#
# Every object is built with AddressSanitizer + UBSan, and warnings are errors.

# (make predefines CXX as `c++`, so `?=` would never apply; `make CXX=g++`
# on the command line still overrides this)
CXX      := clang++
CXXFLAGS := -std=c++17 -Wall -Wextra -Wshadow -Werror -g
SANITIZE := -fsanitize=address,undefined
# -MMD -MP write a .d file per object listing the headers it includes, so
# editing fs.h or config.h rebuilds everything that depends on it.
CPPFLAGS := -Isrc -MMD -MP

# GoogleTest: Homebrew on macOS; on Linux (no brew) the system paths are used.
# Override with `make test GTEST_PREFIX=/some/path`.
GTEST_PREFIX   ?= $(shell brew --prefix googletest 2>/dev/null)
GTEST_CPPFLAGS := $(if $(GTEST_PREFIX),-isystem $(GTEST_PREFIX)/include)
GTEST_LDFLAGS  := $(if $(GTEST_PREFIX),-L$(GTEST_PREFIX)/lib) -lgtest -lgtest_main

BUILD := build

# Everything in src/ except main.cpp is shared by the shell and the tests.
LIB_SRCS  := $(filter-out src/main.cpp,$(wildcard src/*.cpp))
APP_SRCS  := src/main.cpp
TEST_SRCS := $(wildcard tests/*.cpp)

LIB_OBJS  := $(LIB_SRCS:%.cpp=$(BUILD)/%.o)
APP_OBJS  := $(APP_SRCS:%.cpp=$(BUILD)/%.o)
TEST_OBJS := $(TEST_SRCS:%.cpp=$(BUILD)/%.o)

.PHONY: all run test clean

all: $(BUILD)/kernel

$(BUILD)/kernel: $(LIB_OBJS) $(APP_OBJS)
	$(CXX) $(CXXFLAGS) $(SANITIZE) $^ -o $@

$(BUILD)/test_fs: $(LIB_OBJS) $(TEST_OBJS)
	$(CXX) $(CXXFLAGS) $(SANITIZE) $^ $(GTEST_LDFLAGS) -o $@

$(BUILD)/src/%.o: src/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CPPFLAGS) $(CXXFLAGS) $(SANITIZE) -c $< -o $@

# Tests also need the GoogleTest headers. -isystem (not -I) so warnings inside
# gtest's own headers don't trip -Werror.
$(BUILD)/tests/%.o: tests/%.cpp
	@mkdir -p $(dir $@)
	$(CXX) $(CPPFLAGS) $(GTEST_CPPFLAGS) $(CXXFLAGS) $(SANITIZE) -c $< -o $@

run: $(BUILD)/kernel
	./$(BUILD)/kernel

# Homebrew's libgtest isn't built with ASan, and sharing std::vector with
# uninstrumented code makes ASan's container-overflow check report false
# positives inside gtest's own startup. Only that check is turned off; every
# other ASan/UBSan check still runs. (The real fix is building gtest from
# source with the same flags, e.g. via CMake FetchContent.)
test: $(BUILD)/test_fs
	ASAN_OPTIONS=detect_container_overflow=0 ./$(BUILD)/test_fs

clean:
	rm -rf $(BUILD)

-include $(LIB_OBJS:.o=.d) $(APP_OBJS:.o=.d) $(TEST_OBJS:.o=.d)
