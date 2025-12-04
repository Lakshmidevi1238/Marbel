package com.marblejar.mapper;


import com.marblejar.entity.MarbleType;
import com.marblejar.entity.Priority;


public final class MarbleMapper {


private MarbleMapper() {}


public static MarbleType fromPriority(Priority p) {
if (p == null) return MarbleType.NORMAL;
switch (p) {
case HIGH:
return MarbleType.SPECIAL;
case MEDIUM:
return MarbleType.GOLD;
case LOW:
default:
return MarbleType.NORMAL;
}
}
}