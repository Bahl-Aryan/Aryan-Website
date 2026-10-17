// GoogleTest suite for the shell's line parsing (src/shell.h).
// AI generated
//
// Same conventions as test_fs.cpp: expected values written out literally,
// and failures checked for leaving their outputs untouched.

#include <gtest/gtest.h>

#include <ostream>
#include <string>
#include <vector>

#include "shell.h"
#include "test_helpers.h"

using Words = std::vector<std::string>;

// ---------------------------------------------------------------------------
// splitWords

TEST(SplitWords, SplitsOnSpaces) {
  EXPECT_EQ(Shell::splitWords("ls /a"), (Words{"ls", "/a"}));
  EXPECT_EQ(Shell::splitWords("mv a.txt b.txt"), (Words{"mv", "a.txt", "b.txt"}));
}

TEST(SplitWords, CollapsesRunsOfSpacesAndTabs) {
  EXPECT_EQ(Shell::splitWords("  ls    /a  "), (Words{"ls", "/a"}));
  EXPECT_EQ(Shell::splitWords("\tls\t\t/a\t"), (Words{"ls", "/a"}));
  EXPECT_EQ(Shell::splitWords(" \t ls \t /a"), (Words{"ls", "/a"}));
}

TEST(SplitWords, EmptyAndBlankLinesHaveNoWords) {
  EXPECT_EQ(Shell::splitWords(""), Words{});
  EXPECT_EQ(Shell::splitWords("   "), Words{});
  EXPECT_EQ(Shell::splitWords("\t \t"), Words{});
}

TEST(SplitWords, KeepsPathsFlagsAndDotsInsideWords) {
  EXPECT_EQ(Shell::splitWords("rm -r ./a/../b/"), (Words{"rm", "-r", "./a/../b/"}));
  EXPECT_EQ(Shell::splitWords("cd .."), (Words{"cd", ".."}));
}

TEST(SplitWords, RedirectIsItsOwnWordWithOrWithoutSpaces) {
  EXPECT_EQ(Shell::splitWords("echo hi > a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi>a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi >a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi> a.txt"), (Words{"echo", "hi", ">", "a.txt"}));
}

TEST(SplitWords, AppendIsOneWordWithOrWithoutSpaces) {
  EXPECT_EQ(Shell::splitWords("echo hi >> a.txt"), (Words{"echo", "hi", ">>", "a.txt"}));
  EXPECT_EQ(Shell::splitWords("echo hi>>a.txt"), (Words{"echo", "hi", ">>", "a.txt"}));
}

TEST(SplitWords, RunsOfArrowsSplitIntoPairsLeftToRight) {
  // "maximal munch": each > takes the next > if it can
  EXPECT_EQ(Shell::splitWords(">>>"), (Words{">>", ">"}));
  EXPECT_EQ(Shell::splitWords(">>>>>"), (Words{">>", ">>", ">"}));
  EXPECT_EQ(Shell::splitWords(">>>>>>"), (Words{">>", ">>", ">>"}));
  EXPECT_EQ(Shell::splitWords("> >"), (Words{">", ">"}));
}

TEST(SplitWords, ArrowAtTheEndOfTheLine) {
  // reading past the end here would be caught by ASan
  EXPECT_EQ(Shell::splitWords("echo hi >"), (Words{"echo", "hi", ">"}));
  EXPECT_EQ(Shell::splitWords("echo hi>"), (Words{"echo", "hi", ">"}));
  EXPECT_EQ(Shell::splitWords(">"), Words{">"});
}

TEST(SplitWords, WordAfterAnArrowStartsFresh) {
  // the word before the arrow must not leak into the word after it
  EXPECT_EQ(Shell::splitWords("abc>def"), (Words{"abc", ">", "def"}));
  EXPECT_EQ(Shell::splitWords("abc>>def>ghi"), (Words{"abc", ">>", "def", ">", "ghi"}));
}

TEST(SplitWords, QuotesAreNotSpecial) {
  // quotes aren't supported: they stay part of the word
  EXPECT_EQ(Shell::splitWords("echo \"hello world\""),
            (Words{"echo", "\"hello", "world\""}));
}

// ---------------------------------------------------------------------------
// parseCommand: valid lines

TEST(ParseCommand, PlainCommandHasNoRedirect) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("ls /a", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, (Words{"ls", "/a"}));
  EXPECT_FALSE(cmd.redirectExists);
}

TEST(ParseCommand, ReplaceRedirect) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("echo hello world > notes.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, (Words{"echo", "hello", "world"}));
  EXPECT_TRUE(cmd.redirectExists);
  EXPECT_EQ(cmd.redirectTarget, "notes.txt");
  EXPECT_FALSE(cmd.shouldAppend);
}

TEST(ParseCommand, AppendRedirect) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("pwd >> log.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{"pwd"});
  EXPECT_TRUE(cmd.redirectExists);
  EXPECT_EQ(cmd.redirectTarget, "log.txt");
  EXPECT_TRUE(cmd.shouldAppend);
}

TEST(ParseCommand, RedirectWithoutSpaces) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("pwd>>log.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{"pwd"});
  EXPECT_EQ(cmd.redirectTarget, "log.txt");
  EXPECT_TRUE(cmd.shouldAppend);
}

TEST(ParseCommand, RedirectTargetCanBeAPath) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("ls > /a/b/out.txt", cmd), Status::Ok);
  EXPECT_EQ(cmd.redirectTarget, "/a/b/out.txt");
}

TEST(ParseCommand, EmptyAndBlankLinesParseToNothingToRun) {
  ParsedCommand cmd;
  EXPECT_EQ(Shell::parseCommand("", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{});
  EXPECT_FALSE(cmd.redirectExists);

  EXPECT_EQ(Shell::parseCommand(" \t ", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{});
  EXPECT_FALSE(cmd.redirectExists);
}

TEST(ParseCommand, SuccessReplacesEverythingInOut) {
  // leftovers from an earlier parse must not survive
  ParsedCommand cmd;
  ASSERT_EQ(Shell::parseCommand("echo a >> old.txt", cmd), Status::Ok);

  EXPECT_EQ(Shell::parseCommand("ls", cmd), Status::Ok);
  EXPECT_EQ(cmd.words, Words{"ls"});
  EXPECT_FALSE(cmd.redirectExists);
  EXPECT_EQ(cmd.redirectTarget, "");
  EXPECT_FALSE(cmd.shouldAppend);
}

// ---------------------------------------------------------------------------
// parseCommand: syntax errors (table-driven)

class ParseCommandError : public ::testing::TestWithParam<std::string> {};

TEST_P(ParseCommandError, IsRejectedAndLeavesOutUntouched) {
  ParsedCommand cmd;
  cmd.words = {"untouched"};
  cmd.redirectTarget = "untouched";

  EXPECT_EQ(Shell::parseCommand(GetParam(), cmd), Status::InvalidArguments);
  EXPECT_EQ(cmd.words, Words{"untouched"});
  EXPECT_EQ(cmd.redirectTarget, "untouched");
  EXPECT_FALSE(cmd.redirectExists);
}

INSTANTIATE_TEST_SUITE_P(
    SyntaxErrors, ParseCommandError,
    ::testing::Values(
        "> a.txt",            // no command before the operator
        ">> a.txt",           // no command before the operator
        ">",                  // nothing at all around it
        "echo hi >",          // no target
        "echo hi >>",         // no target
        "echo hi > a b",      // extra word after the target
        "echo hi > a.txt b",  // extra word after the target
        "echo hi > >> a",     // target is another operator
        "echo hi > >",        // target is another operator
        "echo a > b > c",     // two redirects
        "echo a > b >> c",    // two redirects
        ">>>>>>",             // only operators
        "echo hi >> >> >>",   // operators after the command
        "echo hi >>> a"));    // >> then > : two operators
