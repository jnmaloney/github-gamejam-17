import os



colourNames = ['0', '1', '2', '3', '4', '5', '6', '7']
buildingNames = ['Airport', 'Castle', 'City', 'Estate', 'Factory', 'Laboratory']
unitNames = [
    'Infantry', 'Infantry_S',
    'Tank', 'Tank_S', 
    'Artillery', 'Artillery_S', 
    'Harvester', 'Harvester_S', 
    'Supply', 'Supply_S',
    ]


rows = 0

def makerow(s):
    global rows
    outfile = "../_img_gen/row" + str(rows) + ".png"
    rows += 1
    cm = "convert " + s + " +append " + outfile
    os.system(cm)
    
def collectrows(outfile):
    global rows
    rows = 0
    cm = "convert ../_img_gen/row* -append " + outfile
    os.system(cm)
    cm = "rm ../_img_gen/row*"
    os.system(cm)

os.system("mkdir ../_img_gen")
for clr in colourNames:
    os.system("mkdir ../_img_gen/color" + clr)

# Buildings - Standing
for clr in colourNames:
    for bldg in buildingNames:
        makerow("../_img_all/color" + clr + "/" + bldg + "_Large_face0_*")
    outfile = "../_img_gen/color" + clr + "/bldg.png"
    collectrows(outfile)

# Buildings - Explode
for clr in colourNames:
    for bldg in buildingNames:
        makerow("../_img_all/animation_frames/color" + clr + "_" + bldg + "_Large_face0_fiery_explode*")
    outfile = "../_img_gen/color" + clr + "/bldg_expl.png"
    collectrows(outfile)


# Units - standing
for clr in colourNames:
    for unit in unitNames:
        for facing in range(4):
            makerow("../_img_all/color" + clr + "/" + unit + "_Large_face" + str(facing) + "_*")
        outfile = "../_img_gen/color" + clr + "/" + unit + ".png"
        collectrows(outfile)
    
# Units - firing
for clr in colourNames:
    for unit in unitNames:
        for facing in range(4):
            makerow("../_img_all/animation_frames/color" + clr + "_" + unit + "_Large_face" + str(facing) + "_attack_0*")
        outfile = "../_img_gen/color" + clr + "/" + unit + "_atk0.png"
        collectrows(outfile)
        
for clr in colourNames:
    for unit in unitNames:
        for facing in range(4):
            makerow("../_img_all/animation_frames/color" + clr + "_" + unit + "_Large_face" + str(facing) + "_attack_1*")
        outfile = "../_img_gen/color" + clr + "/" + unit + "_atk1.png"
        collectrows(outfile)

# Units - Explode
for clr in colourNames:
    for unit in unitNames:
        for facing in range(4):
            makerow("../_img_all/animation_frames/color" + clr + "_" + unit + "_Large_face" + str(facing) + "_fiery_explode*")
        outfile = "../_img_gen/color" + clr + "/" + unit + "_expl.png"
        collectrows(outfile)

