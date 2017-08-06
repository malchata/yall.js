const gulp = require("gulp");
const util = require("gulp-util");
const uglify = require("gulp-uglify");
const optimize = require("gulp-optimize-js");
const del = require("del");

gulp.task("default", ()=>{
	let src = "src/*.js",
		dest = "dist";

	return gulp.src(src)
		.on("error", console.error.bind(console))
		.pipe(uglify())
		.pipe(optimize())
		.pipe(gulp.dest(dest));
});

gulp.task("clean", ()=>{
	return del("dist");
});

gulp.task("watch", ()=>{
	let src = "src/*.js";
	gulp.watch(src, ["default"]);
});
